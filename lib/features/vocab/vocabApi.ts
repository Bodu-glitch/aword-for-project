// filepath: /home/bo/repos/Aword/lib/features/vocab/vocabApi.ts
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase";
import type { Vocabulary } from "@/models/Vocabulary";

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

    // Update profile_vocab_progress based on a learning session results
    updateVocabsProgress: builder.mutation<
      { updated: number },
      { questionResults: QuestionResult[] }
    >({
      async queryFn({ questionResults }) {
        try {
          if (!questionResults || questionResults.length === 0) {
            return { data: { updated: 0 } };
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

          // 2) Aggregate results by vocabId (accuracy and avg time)
          const byVocab = new Map<
            string,
            { attempts: number; correct: number; times: number[] }
          >();
          for (const r of questionResults) {
            if (!r.vocabId) continue;
            const bucket = byVocab.get(r.vocabId) || {
              attempts: 0,
              correct: 0,
              times: [],
            };
            bucket.attempts += 1;
            bucket.correct += r.isCorrect ? 1 : 0;
            if (Number.isFinite(r.durationSec))
              bucket.times.push(Math.max(0, r.durationSec));
            byVocab.set(r.vocabId, bucket);
          }

          const nowIso = new Date().toISOString();
          let updated = 0;

          // 3) For each vocab, fetch existing progress then upsert with new proficiency
          for (const [vocabId, stats] of byVocab.entries()) {
            const accuracy =
              stats.attempts > 0 ? stats.correct / stats.attempts : 0;
            const avgTime =
              stats.times.length > 0
                ? stats.times.reduce((a, b) => a + b, 0) / stats.times.length
                : 10; // assume slow if missing
            const delta = computeSessionDelta(accuracy, avgTime);

            // 3a) Get existing proficiency (if any)
            const { data: existingRows, error: selectErr } = await supabase
              .from("profile_vocab_progress")
              .select("proficiency")
              .eq("profile_id", profileId)
              .eq("vocab_id", vocabId)
              .limit(1);
            if (selectErr) {
              return {
                error: { message: selectErr.message, code: selectErr.code },
              };
            }
            const existing = existingRows?.[0]?.proficiency ?? 0;

            // 3b) Combine with decay and cap to [0,1]
            const decayed = existing * 0.85; // slight decay encourages regular review
            const next = clamp01(round2(decayed + delta * 0.6));

            // 3c) Upsert row; let first_learned_at default on insert
            const { error: upsertErr } = await supabase
              .from("profile_vocab_progress")
              .upsert(
                {
                  profile_id: profileId,
                  vocab_id: vocabId,
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
          }
          console.log(`Updated progress for ${updated} vocabs`, byVocab);

          return { data: { updated } };
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
