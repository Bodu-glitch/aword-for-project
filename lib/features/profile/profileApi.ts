import { leaderboardSupabase, supabase } from "@/lib/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

// Lightweight error shape for queryFn
type Error = { message: string; code?: string };

export interface Profile {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  avatar_url: string;
  streak_days: number;
  last_active_at: string;
  role: string;
}

export interface UpdateProfileInput {
  full_name?: string;
  email?: string;
}

export interface UpdateAvatarInput {
  imageUri: string;
}

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fakeBaseQuery<Error>(),
  endpoints: (builder) => ({
    getProfile: builder.query<Profile, void>({
      async queryFn(_arg, _api, _extraOptions, _baseQuery) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            return {
              error: {
                message: "User not authenticated",
                code: "UNAUTHORIZED",
              },
            };
          }

          const profileId = user.id;

          const { data, error } = await supabase
            .from("profiles")
            .select(
              "id, created_at, email, full_name, avatar_url, streak_days, last_active_at, role",
            )
            .eq("id", profileId)
            .single();

          if (error) {
            return {
              error: { message: error.message, code: error.code },
            };
          }

          return { data } as { data: Profile };
        } catch (e: any) {
          return {
            error: { message: e?.message ?? "Unknown error", code: "UNKNOWN" },
          };
        }
      },
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<Profile, UpdateProfileInput>({
      async queryFn(input, _api, _extraOptions, _baseQuery) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            return {
              error: {
                message: "User not authenticated",
                code: "UNAUTHORIZED",
              },
            };
          }

          const profileId = user.id;
          const updateData: Partial<Profile> = {};

          // Only update fields that are provided
          if (input.full_name !== undefined) {
            updateData.full_name = input.full_name.trim();
          }
          if (input.email !== undefined) {
            updateData.email = input.email.trim();
          }

          // Update profile in Supabase
          const { data, error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", profileId)
            .select(
              "id, created_at, email, full_name, avatar_url, streak_days, last_active_at",
            )
            .single();

          if (error) {
            return {
              error: { message: error.message, code: error.code },
            };
          }

          // Update auth metadata if full_name is being updated
          if (input.full_name !== undefined) {
            const { error: updateError } = await supabase.auth.updateUser({
              data: {
                full_name: input.full_name.trim(),
              },
            });

            if (updateError) {
              console.error("Error updating auth metadata:", updateError);
              // Don't fail the request if auth metadata update fails
            }
          }

          return { data } as { data: Profile };
        } catch (e: any) {
          return {
            error: { message: e?.message ?? "Unknown error", code: "UNKNOWN" },
          };
        }
      },
      invalidatesTags: ["Profile"],
    }),
    updateAvatar: builder.mutation<{ avatar_url: string }, UpdateAvatarInput>({
      async queryFn({ imageUri }, _api, _extraOptions, _baseQuery) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            return {
              error: {
                message: "User not authenticated",
                code: "UNAUTHORIZED",
              },
            };
          }

          const profileId = user.id;
          const filePath = `${profileId}/avatar`;

          // Read file as ArrayBuffer using fetch
          let bytes: Uint8Array;
          try {
            const response = await fetch(imageUri);
            const arrayBuffer = await response.arrayBuffer();
            bytes = new Uint8Array(arrayBuffer);
          } catch (fetchError: any) {
            return {
              error: {
                message:
                  fetchError?.message ||
                  "Failed to read image file. Please try again or select a different image.",
                code: "FILE_READ_ERROR",
              },
            };
          }

          // Determine content type from file extension
          const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";
          const contentType = `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;

          // Upload to Supabase storage with path: profileId/avatar
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, bytes, {
              contentType,
              upsert: true,
            });

          if (uploadError) {
            // If bucket doesn't exist or has permission issues
            if (
              uploadError.message.includes("Bucket") ||
              uploadError.message.includes("bucket")
            ) {
              return {
                error: {
                  message:
                    "Storage bucket 'avatars' not found. Please create it in Supabase Storage dashboard.",
                  code: uploadError.message,
                },
              };
            }
            return {
              error: {
                message:
                  uploadError.message ||
                  "Failed to upload avatar. Please try again.",
                code: uploadError.message,
              },
            };
          }

          // Update profile with the path (profileId/avatar)
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ avatar_url: filePath })
            .eq("id", profileId);

          if (updateError) {
            return {
              error: { message: updateError.message, code: updateError.code },
            };
          }

          return { data: { avatar_url: filePath } };
        } catch (e: any) {
          return {
            error: { message: e?.message ?? "Unknown error", code: "UNKNOWN" },
          };
        }
      },
      invalidatesTags: ["Profile"],
    }),

    // New endpoint: getTotalExp for current authenticated user
    getTotalExp: builder.query<number, void>({
      async queryFn(_arg, _api, _extraOptions, _baseQuery) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            return {
              error: {
                message: "User not authenticated",
                code: "UNAUTHORIZED",
              },
            };
          }

          const userId = user.id;

          // Fetch xp_events rows for the user and sum points in JS
          const { data: xpRows, error } = await leaderboardSupabase
            .from("xp_events")
            .select("points")
            .eq("user_id", userId);

          if (error) {
            return { error: { message: error.message, code: error.code } };
          }

          const total = Array.isArray(xpRows)
            ? xpRows.reduce(
                (s: number, r: any) => s + (Number(r.points) || 0),
                0,
              )
            : 0;

          return { data: total };
        } catch (e: any) {
          return {
            error: { message: e?.message ?? "Unknown error", code: "UNKNOWN" },
          };
        }
      },
      providesTags: ["Profile"],
    }),

    // New endpoint: getLastWeekRank for the current authenticated user
    getLastWeekRank: builder.query<
      {
        rank: number | null;
        week_id: string | null;
        week_start: string | null;
      },
      void
    >({
      async queryFn(_arg, _api, _extraOptions, _baseQuery) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            return {
              error: {
                message: "User not authenticated",
                code: "UNAUTHORIZED",
              },
            };
          }

          // Find most recent closed week
          const { data: weeks, error: weeksError } = await leaderboardSupabase
            .from("weeks")
            .select("id, week_start")
            .eq("status", "closed")
            .order("week_start", { ascending: false })
            .limit(1);

          if (weeksError) {
            return {
              error: { message: weeksError.message, code: weeksError.code },
            };
          }

          if (!weeks || weeks.length === 0) {
            return { data: { rank: null, week_id: null, week_start: null } };
          }

          const week = weeks[0] as any;
          const weekId = week.id as string;

          // Fetch all xp_events for that week and aggregate totals per user
          const { data: xpRows, error: xpError } = await leaderboardSupabase
            .from("xp_events")
            .select("user_id, points")
            .eq("week_id", weekId);

          if (xpError) {
            return { error: { message: xpError.message, code: xpError.code } };
          }

          const totals = new Map<string, number>();
          if (Array.isArray(xpRows)) {
            xpRows.forEach((r: any) => {
              const uid = String(r.user_id);
              const pts = Number(r.points) || 0;
              totals.set(uid, (totals.get(uid) || 0) + pts);
            });
          }

          const entries = Array.from(totals.entries()).map(([uid, pts]) => ({
            uid,
            pts,
          }));
          entries.sort((a, b) => b.pts - a.pts);

          const idx = entries.findIndex((e) => e.uid === user.id);
          const rank = idx === -1 ? null : idx + 1;

          return {
            data: {
              rank,
              week_id: weekId,
              week_start: week.week_start ?? null,
            },
          };
        } catch (e: any) {
          return {
            error: { message: e?.message ?? "Unknown error", code: "UNKNOWN" },
          };
        }
      },
      providesTags: ["Profile"],
    }),

    // Alternative RPC-backed endpoint: getLastWeekRankRpc
    // Requires you to define a Postgres function `leaderboard.get_last_week_rank()` that returns
    // { rank bigint, week_id uuid, week_start timestamp with time zone }
    getLastWeekRankRpc: builder.query<
      {
        rank: number | null;
        week_id: string | null;
        week_start: string | null;
      },
      void
    >({
      async queryFn(_arg, _api, _extraOptions, _baseQuery) {
        try {
          // call RPC on leaderboard schema - this must be created in DB
          const { data, error } =
            await leaderboardSupabase.rpc("get_last_week_rank");
          if (error) {
            return { error: { message: error.message, code: error.code } };
          }

          // RPC may return row or array
          const payload = Array.isArray(data) ? data[0] : data;
          if (!payload) {
            return { data: { rank: null, week_id: null, week_start: null } };
          }

          return {
            data: {
              rank:
                payload.rank === null || payload.rank === undefined
                  ? null
                  : Number(payload.rank),
              week_id: payload.week_id ?? null,
              week_start: payload.week_start ?? null,
            },
          };
        } catch (e: any) {
          return {
            error: { message: e?.message ?? "Unknown error", code: "UNKNOWN" },
          };
        }
      },
      providesTags: ["Profile"],
    }),
  }),
  tagTypes: ["Profile"],
});

export const {
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useGetTotalExpQuery,
  useGetLastWeekRankQuery,
  useGetLastWeekRankRpcQuery,
} = profileApi;
