import { supabase } from "@/lib/supabase";
import type { Vocabulary } from "@/models/Vocabulary";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

// Lightweight error shape for queryFn
type VocabError = { message: string; code?: string };

// Types for progress updates
export type QuestionResult = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  vocabId: string;
  durationSec: number; // time to answer the question in seconds
};

// Helper: clamp and round to 2 decimals
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const round2 = (n: number) => Math.round(n * 100) / 100;

// Compute a proficiency delta from accuracy (0..1) and average time in seconds
// Fast and correct answers yield higher scores; slow/incorrect yield lower
function computeSessionDelta(accuracy: number, avgTimeSec: number): number {
  // Time weight: 1.0 if <= 3s, ~0.4 at 10s, min 0.2 beyond
  let timeWeight: number;
  if (avgTimeSec <= 3) timeWeight = 1;
  else if (avgTimeSec >= 10) timeWeight = 0.2;
  else {
    // linear between 3s..10s from 1 -> 0.4
    const t = (avgTimeSec - 3) / 7; // 0..1
    timeWeight = 1 - t * 0.6; // 1..0.4
  }
  const base = 0.2; // minimal credit when correct
  const delta = accuracy * (base + 0.8 * timeWeight); // 0..1
  return clamp01(round2(delta));
}

// RTK Query slice that uses Supabase client directly via `queryFn`
// This demonstrates making multiple sequential Supabase calls inside a single endpoint
export const vocabApi = createApi({
  reducerPath: "vocabApi",
  baseQuery: fakeBaseQuery<VocabError>(),
  endpoints: (builder) => ({
    // Fetch a random vocabulary row by first counting and then querying with a random offset
    getRandomVocabulary: builder.query<Vocabulary | null, void>({
      async queryFn(_arg, _api, _extraOptions, _baseQuery) {
        try {
          // First call: get total count of rows
          const { count, error: countError } = await supabase
            .from("vocab")
            .select("*", { count: "exact", head: true });

          if (countError || !count || count === 0) {
            return {
              error: {
                message:
                  countError?.message ||
                  "Error fetching vocabulary count or zero rows",
                code: countError?.code ?? "COUNT_ERROR",
              },
            };
          }

          // Generate a random offset within [0, count-1]
          const randomOffset = Math.floor(Math.random() * count);

          // Second call: fetch one row at the random offset
          const { data, error } = await supabase
            .from("vocab")
            .select("*")
            .range(randomOffset, randomOffset)
            .limit(1);

          if (error) {
            return { error: { message: error.message, code: error.code } };
          }

          if (data && data.length > 0) {
            return { data: data[0] as Vocabulary };
          }

          return { data: null };
        } catch (e: any) {
          return {
            error: { message: e?.message ?? "Unknown error", code: "UNKNOWN" },
          };
        }
      },
      keepUnusedDataFor: 0,
    }),
    // Update progress for vocab (roots) and sub-vocab items based on session results
    updateVocabsProgress: builder.mutation<
      { updated: number; subRootsLinked: number },
      {
        questionResults: QuestionResult[];
        // Minimal shape for items inside questionsData.allWords
        allWords: Array<{
          id: string;
          root_id?: string | null;
          sub_root_id?: string | null;
        }>;
      }
    >({
      async queryFn({ questionResults, allWords }) {
        try {
          if (!questionResults || questionResults.length === 0) {
            return { data: { updated: 0, subRootsLinked: 0 } };
          }

          // 1) Get current user for profile_id
          const { data: userData, error: userError } =
            await supabase.auth.getUser();
          if (userError || !userData?.user?.id) {
            return {
              error: {
                message: userError?.message || "Not authenticated",
                code: userError?.name || "NO_USER",
              },
            };
          }
          const profileId = userData.user.id;

          // 2) Aggregate results by item id (maps to vocab_id or sub_vocab_id depending on type)
          const statsById = new Map<
            string,
            { attempts: number; correct: number; times: number[] }
          >();
          for (const r of questionResults) {
            if (!r.vocabId) continue;
            const bucket = statsById.get(r.vocabId) || {
              attempts: 0,
              correct: 0,
              times: [],
            };
            bucket.attempts += 1;
            bucket.correct += r.isCorrect ? 1 : 0;
            if (Number.isFinite(r.durationSec))
              bucket.times.push(Math.max(0, r.durationSec));
            statsById.set(r.vocabId, bucket);
          }

          const nowIso = new Date().toISOString();
          let updated = 0;
          let subRootsLinked = 0;

          // 3) Walk through allWords; decide which table to update
          for (const item of allWords ?? []) {
            const { id, root_id, sub_root_id } = item as any;

            // Find stats for this item (by id). If none, skip update.
            const stats = statsById.get(id);
            if (!stats) continue;

            const accuracy =
              stats.attempts > 0 ? stats.correct / stats.attempts : 0;
            const avgTime =
              stats.times.length > 0
                ? stats.times.reduce((a, b) => a + b, 0) / stats.times.length
                : 10; // assume slow if missing
            const delta = computeSessionDelta(accuracy, avgTime);

            if (sub_root_id) {
              // Sub-vocab branch: update profile_sub_vocab_progress
              const { data: existingRows, error: selectErr } = await supabase
                .from("profile_sub_vocab_progress")
                .select("proficiency")
                .eq("profile_id", profileId)
                .eq("sub_vocab_id", id)
                .limit(1);
              if (selectErr) {
                return {
                  error: { message: selectErr.message, code: selectErr.code },
                };
              }
              const existing = existingRows?.[0]?.proficiency ?? 0;
              const decayed = existing * 0.85;
              const next = clamp01(round2(decayed + delta * 0.6));

              const { error: upsertErr } = await supabase
                .from("profile_sub_vocab_progress")
                .upsert(
                  {
                    profile_id: profileId,
                    sub_vocab_id: id,
                    proficiency: next,
                    last_seen_at: nowIso,
                  },
                  { onConflict: "profile_id,sub_vocab_id" },
                );
              if (upsertErr) {
                return {
                  error: { message: upsertErr.message, code: upsertErr.code },
                };
              }
              updated += 1;

              // Ensure a row exists for the sub-root, set is_learning = false
              const { error: upsertSubRootErr } = await supabase
                .from("profile_sub_root_progress")
                .upsert(
                  {
                    profile_id: profileId,
                    sub_root_id: sub_root_id,
                    is_learning: false,
                  },
                  { onConflict: "profile_id,sub_root_id" },
                );
              if (upsertSubRootErr) {
                return {
                  error: {
                    message: upsertSubRootErr.message,
                    code: upsertSubRootErr.code,
                  },
                };
              }
              subRootsLinked += 1;
              continue;
            }

            if (root_id) {
              // Root vocab branch: update profile_vocab_progress
              const { data: existingRows, error: selectErr } = await supabase
                .from("profile_vocab_progress")
                .select("proficiency")
                .eq("profile_id", profileId)
                .eq("vocab_id", id)
                .limit(1);
              if (selectErr) {
                return {
                  error: { message: selectErr.message, code: selectErr.code },
                };
              }
              const existing = existingRows?.[0]?.proficiency ?? 0;
              const decayed = existing * 0.85;
              const next = clamp01(round2(decayed + delta * 0.6));

              const { error: upsertErr } = await supabase
                .from("profile_vocab_progress")
                .upsert(
                  {
                    profile_id: profileId,
                    vocab_id: id,
                    proficiency: next,
                    last_seen_at: nowIso,
                  },
                  { onConflict: "profile_id,vocab_id" },
                );
              if (upsertErr) {
                return {
                  error: { message: upsertErr.message, code: upsertErr.code },
                };
              }
              updated += 1;
              continue;
            }
            // If neither root_id nor sub_root_id is present, ignore item
          }

          return { data: { updated, subRootsLinked } };
        } catch (e: any) {
          return {
            error: { message: e?.message ?? "Unknown error", code: "UNKNOWN" },
          };
        }
      },
    }),
  }),
});

export const { useGetRandomVocabularyQuery, useUpdateVocabsProgressMutation } =
  vocabApi;
