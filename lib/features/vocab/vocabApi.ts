import { leaderboardSupabase, supabase } from "@/lib/supabase";
import type { Vocabulary } from "@/models/Vocabulary";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Root } from "@/models/Root";

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

// compute streak function
async function updateUserStreak(profileId: string) {
  console.log("Updating streak for user", profileId);
  const today = new Date().toLocaleDateString("en-CA"); // yyyy-mm-dd
  console.log("Today's date:", today);

  // Lấy streak hiện tại
  const { data: streak } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (!streak) return;

  const lastDate = streak.last_active_at
    ? new Date(streak.last_active_at).toISOString().split("T")[0]
    : null;
  console.log('last active date format should be "yyyy-mm-dd"', lastDate);
  console.log(today === lastDate);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  console.log("Yesterday's date:", yesterdayStr);
  console.log("Comparing lastDate with yesterday:", lastDate === yesterdayStr);

  let currentStreak = streak.streak_days;

  if (lastDate === yesterdayStr) {
    // hôm qua có học → streak +1
    currentStreak += 1;
  } else if (lastDate === today) {
    // đã tính streak hôm nay rồi → không làm gì
    return;
  } else {
    // bị đứt streak → reset
    currentStreak = 1;
  }

  console.log("Updating streak for user", profileId, "to", currentStreak);

  await supabase
    .from("profiles")
    .update({
      streak_days: currentStreak,
      last_active_at: today,
    })
    .eq("id", profileId);
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
      { updated: number; subRootsLinked: number; expGained: number },
      {
        questionResults: QuestionResult[];
        // Minimal shape for items inside questionsData.allWords
        allWords: {
          id: string;
          root_id?: string | null;
          sub_root_id?: string | null;
        }[];
      }
    >({
      async queryFn({ questionResults, allWords }) {
        try {
          if (!questionResults || questionResults.length === 0) {
            return { data: { updated: 0, subRootsLinked: 0, expGained: 0 } };
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
              // end of this iteration
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
              console.log(
                "Updating vocab progress with",
                questionResults.length,
                "question results and",
                allWords.length,
                "total words",
              );

              const existing = existingRows?.[0]?.proficiency ?? 0;
              const decayed = existing * 0.85;
              const next = clamp01(round2(decayed + delta * 0.6));

              const { error: upsertErr } = await supabase
                .from("profile_vocab_progress")
                .upsert({
                  profile_id: profileId,
                  vocab_id: id,
                  proficiency: next,
                  last_seen_at: nowIso,
                });
              if (upsertErr) {
                console.log(
                  "Error upserting profile_vocab_progress:",
                  upsertErr,
                );
                return {
                  error: { message: upsertErr.message, code: upsertErr.code },
                };
              }
              updated += 1;
            }
            // If neither root_id nor sub_root_id is present, ignore item
          }

          // Calculate correct answer 2 points for each item

          const groupedByVocab = new Map<string, QuestionResult[]>();

          for (const r of questionResults) {
            if (!groupedByVocab.has(r.vocabId))
              groupedByVocab.set(r.vocabId, []);
            groupedByVocab.get(r.vocabId)!.push(r);
          }

          let totalScore = 0;

          for (const [vocabId, attempts] of groupedByVocab.entries()) {
            // Tìm lần đầu tiên trả lời đúng
            const firstCorrectIndex = attempts.findIndex((a) => a.isCorrect);
            if (firstCorrectIndex === -1) continue; // chưa bao giờ đúng
            const penalty = firstCorrectIndex * 0.5; // mỗi lần sai trừ 0.5 điểm
            const gained = Math.max(2 - penalty, 0.5); // tối thiểu 0.5 điểm nếu cuối cùng đúng
            totalScore += gained;
          }

          const score = Math.round(totalScore);

          console.log("User", profileId, "earned score", score);
          // insert into xp_events
          const { error: xpError } = await leaderboardSupabase
            .from("xp_events")
            .insert({
              user_id: profileId,
              source: "vocab_quiz",
              points: score,
            });

          console.log("Inserted xp_event for user", profileId, "points", score);

          if (xpError) {
            console.log("Error inserting xp_event:", xpError);
            // Do not fail the whole mutation for analytics insert issues
          }

          // Update user streak
          await updateUserStreak(profileId);

          return { data: { updated, subRootsLinked, expGained: score } };
        } catch (e: any) {
          console.log(e);
          return {
            error: { message: e?.message ?? "Unknown error", code: "UNKNOWN" },
          };
        }
      },
    }),
    getTotalLearnedVocabCount: builder.query<number, void>({
      async queryFn(_arg, _api, _extraOptions, _baseQuery) {
        try {
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

          // 2) Query count of vocab with proficiency >= 0.7
          const { count, error } = await supabase
            .from("profile_vocab_progress")
            .select("*", { count: "exact", head: true })
            .eq("profile_id", profileId);

          if (error) {
            return { error: { message: error.message, code: error.code } };
          }

          const { count: subCount, error: subCountError } = await supabase
            .from("profile_sub_vocab_progress")
            .select("*", { count: "exact", head: true })
            .eq("profile_id", profileId);

          if (subCountError) {
            return {
              error: {
                message: subCountError.message,
                code: subCountError.code,
              },
            };
          }

          return { data: (count ?? 0) + (subCount ?? 0) };
        } catch (e: any) {
          return {
            error: { message: e?.message ?? "Unknown error", code: "UNKNOWN" },
          };
        }
      },
      keepUnusedDataFor: 0,
    }),
    getRoots: builder.query<Root[] | null, void>({
      async queryFn(_arg, _api, _extraOptions, _baseQuery) {
        console.log("getRoots queryFn called");
        const { data, error } = await supabase
          .from("roots")
          .select("*,vocab(*)");
        if (error) {
          console.log("Error fetching roots:", error);
          return {
            error: { message: error.message, code: error.code ?? "UNKNOWN" },
          };
        }
        if (!data) {
          return {
            error: { message: "No data returned", code: "NO_DATA" },
          };
        }

        return {
          data: data.map((d) => {
            return {
              ...d,
              word_count: d.vocab ? d.vocab.length : 0,
            };
          }) as Root[],
        };
      },
    }),
    getRootById: builder.query<Root | null, string>({
      async queryFn(id, _api, _extraOptions, _baseQuery) {
        console.log("Fetching root by ID:", id);
        const { data, error } = await supabase
          .from("roots")
          .select("*,vocab(*)")
          .eq("id", id)
          .single();
        if (error) {
          console.log("Error fetching root by ID:", error);
          return {
            error: { message: error.message, code: error.code ?? "UNKNOWN" },
          };
        }
        if (!data) {
          return {
            error: { message: "No data returned", code: "NO_DATA" },
          };
        }

        return {
          data: {
            ...data,
            word_count: data.vocab ? data.vocab.length : 0,
          } as Root,
        };
      },
    }),
    findProgressingRoot: builder.query<boolean | null, void>({
      keepUnusedDataFor: 0,
      async queryFn(_arg, _api, _extraOptions, _baseQuery) {
        //get user id
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user.id;
        if (!userId) {
          return {
            error: { message: "User not authenticated", code: "UNAUTHORIZED" },
          };
        }

        const { data, error } = await supabase
          .from("profile_root_progress")
          .select("root_id")
          .eq("profile_id", userId)
          .eq("is_learning", true)
          .maybeSingle();

        console.log("findProgressingRoot data:", data);
        if (error) {
          console.log("Error finding progressing root:", error);
          return {
            error: { message: error.message, code: error.code ?? "UNKNOWN" },
          };
        }

        return data ? { data: true } : { data: false };
      },
    }),
    assignWordToRoot: builder.mutation<
      null,
      { wordCount: number; rootId: string }
    >({
      async queryFn({ wordCount, rootId }, _api, _extraOptions, _baseQuery) {
        // get word by wordCount
        const { data: vocabData, error: vocabError } = await supabase
          .from("vocab")
          .select("*")
          .eq("root_id", rootId)
          .limit(wordCount)
          .order("id", { ascending: true });

        if (vocabError) {
          console.log("Error fetching vocab:", vocabError);
          return {
            error: {
              message: vocabError.message,
              code: vocabError.code ?? "UNKNOWN",
            },
          };
        }

        const vocabIds = vocabData?.map((v) => v.id) || [];

        // update vocab items to set root_id
        // get current user id once (avoid creating promises inside the upsert rows)
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const profileId = session?.user.id;
        if (!profileId) {
          return {
            error: { message: "User not authenticated", code: "UNAUTHORIZED" },
          };
        }

        const rows = vocabIds.map((vocabId) => ({
          profile_id: profileId,
          vocab_id: vocabId,
        }));

        const { error: updateError } = await supabase
          .from("profile_vocab_progress")
          .upsert(rows);

        if (updateError) {
          console.log("Error updating vocab items:", updateError);
          return {
            error: {
              message: updateError.message,
              code: updateError.code ?? "UNKNOWN",
            },
          };
        }

        // assign the root_id to profile_root_progress
        const { error: rootProgressError } = await supabase
          .from("profile_root_progress")
          .upsert({
            profile_id: profileId,
            root_id: rootId,
            is_learning: true,
          });

        if (rootProgressError) {
          console.log("Error updating root progress:", rootProgressError);
          return {
            error: {
              message: rootProgressError.message,
              code: rootProgressError.code ?? "UNKNOWN",
            },
          };
        }

        // RTK Query requires a defined data value; use null for void-like responses
        return { data: null };
      },
    }),
    getLearningVocabsByProfileId: builder.query<Vocabulary[] | null, void>({
      async queryFn(_arg, _api, _extraOptions, _baseQuery) {
        // get user id
        console.log("Fetched learning vocabs:");

        const {
          data: { session },
        } = await supabase.auth.getSession();
        const profileId = session?.user.id;
        if (!profileId) {
          return {
            error: { message: "User not authenticated", code: "UNAUTHORIZED" },
          };
        }

        const { data, error } = await supabase
          .from("profile_vocab_progress")
          .select("vocab(*,vocab_senses(*),vocab_examples(*))")
          .eq("profile_id", profileId)
          .eq("proficiency", 0);

        console.log("Data:", data);

        if (error) {
          console.log("Error fetching learning vocabs:", error);
          return {
            error: { message: error.message, code: error.code ?? "UNKNOWN" },
          };
        }
        if (!data) {
          return {
            error: { message: "No data returned", code: "NO_DATA" },
          };
        }

        const vocabs = data.map((d) => d.vocab) as unknown as Vocabulary[];
        return {
          data: vocabs.map((v) => {
            return {
              ...v,
              definition_vi:
                v.vocab_senses && v.vocab_senses.length > 0
                  ? v.vocab_senses[0].definition
                  : "",
              pos:
                v.vocab_senses && v.vocab_senses.length > 0
                  ? v.vocab_senses[0].pos
                  : "",
            };
          }),
        };
      },
    }),
    setProgressingRootToFalse: builder.mutation<null, void>({
      async queryFn(_arg, _api, _extraOptions, _baseQuery) {
        // get user id
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const profileId = session?.user.id;
        if (!profileId) {
          return {
            error: { message: "User not authenticated", code: "UNAUTHORIZED" },
          };
        }

        const { error } = await supabase
          .from("profile_root_progress")
          .update({ is_learning: false })
          .eq("profile_id", profileId)
          .eq("is_learning", true);

        if (error) {
          return {
            error: { message: error.message, code: error.code ?? "UNKNOWN" },
          };
        }

        // RTK Query requires a defined data value; use null for void-like responses
        return { data: null };
      },
    }),
  }),
});

export const {
  useGetRandomVocabularyQuery,
  useUpdateVocabsProgressMutation,
  useGetTotalLearnedVocabCountQuery,
  useLazyGetTotalLearnedVocabCountQuery,
  useGetRootsQuery,
  useGetRootByIdQuery,
  useFindProgressingRootQuery,
  useAssignWordToRootMutation,
  useGetLearningVocabsByProfileIdQuery,
  useSetProgressingRootToFalseMutation,
} = vocabApi;
