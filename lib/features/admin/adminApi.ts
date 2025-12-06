import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase";
import showErrorToast from "@/utls/errorToast";

// Generic helpers
type DbError = { message: string; code?: string };

export type Profile = {
  id: string;
  created_at: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  streak_days?: number;
  last_active_at?: string | null;
};
export type RootRow = {
  id: string;
  root_code: string;
  root_meaning?: string | null;
  created_at: string;
};
export type VocabRow = {
  id: string;
  root_id: string;
  word: string;
  prefix?: string | null;
  infix?: string | null;
  postfix?: string | null;
  prefix_meaning?: string | null;
  infix_meaning?: string | null;
  postfix_meaning?: string | null;
  phonetic?: string | null;
  created_at: string;
  audio_path?: string | null;
};
export type SenseRow = {
  id: string;
  vocab_id: string;
  word: string;
  pos: string;
  definition: string;
  sense_order?: number;
  created_at: string;
};
export type ExampleRow = {
  id: string;
  vocab_id: string;
  example_en: string;
  example_vi?: string | null;
  example_order?: number;
  created_at: string;
};
export type VocabSubRootRow = {
  id: string;
  vocab_id: string;
  token: string;
  defination?: string | null;
  created_at: string;
};
export type SubVocabRow = {
  id: string;
  sub_root_id: string;
  word: string;
  prefix?: string | null;
  infix?: string | null;
  postfix?: string | null;
  prefix_meaning?: string | null;
  infix_meaning?: string | null;
  postfix_meaning?: string | null;
  phonetic?: string | null;
  created_at: string;
  audio_path?: string | null;
};
export type SubVocabSenseRow = {
  id: string;
  sub_vocab_id: string;
  word: string;
  pos: string;
  definition: string;
  sense_order?: number;
  created_at: string;
};
export type SubVocabExampleRow = {
  id: string;
  sub_vocab_id: string;
  example_en: string;
  example_vi?: string | null;
  example_order?: number;
  created_at: string;
};

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fakeBaseQuery<DbError>(),
  tagTypes: [
    "Profiles",
    "Roots",
    "Vocab",
    "Senses",
    "Examples",
    "SubRoots",
    "SubVocab",
    "SubSenses",
    "SubExamples",
  ],
  endpoints: (builder) => ({
    // Profiles
    listProfiles: builder.query<
      Profile[],
      { limit?: number; offset?: number } | void
    >({
      async queryFn(arg) {
        const limit = (arg as any)?.limit ?? 50;
        const offset = (arg as any)?.offset ?? 0;
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error)
          return { error: { message: error.message, code: error.code } };
        return { data: (data ?? []) as Profile[] };
      },
      providesTags: [{ type: "Profiles", id: "LIST" }],
    }),
    deleteProfile: builder.mutation<{ id: string }, { id: string }>({
      async queryFn({ id }) {
        const { error } = await supabase.from("profiles").delete().eq("id", id);
        if (error)
          return { error: { message: error.message, code: error.code } };
        return { data: { id } };
      },
      invalidatesTags: [{ type: "Profiles", id: "LIST" }],
    }),
    banProfile: builder.mutation<
      { id: string; banned: boolean },
      { id: string; banned: boolean }
    >({
      async queryFn({ id, banned }) {
        // Try to update a banned column if present; fallback to streak_days
        let { error } = await supabase
          .from("profiles")
          .update({ banned })
          .eq("id", id);
        if (error && error.message?.includes("column")) {
          // Fallback: update streak_days to 0 to mimic ban
          const res = await supabase
            .from("profiles")
            .update({ streak_days: 0 })
            .eq("id", id);
          error = res.error ?? (null as any);
        }
        if (error) return showErrorToast(error);
        return { data: { id, banned } };
      },
      invalidatesTags: [{ type: "Profiles", id: "LIST" }],
    }),

    // Roots
    listRoots: builder.query<
      RootRow[],
      { limit?: number; offset?: number } | void
    >({
      async queryFn(arg) {
        const limit = (arg as any)?.limit ?? 50;
        const offset = (arg as any)?.offset ?? 0;
        const { data, error } = await supabase
          .from("roots")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) return showErrorToast(error);
        return { data: (data ?? []) as RootRow[] };
      },
      providesTags: [{ type: "Roots", id: "LIST" }],
    }),

    // Vocab with join to roots
    listVocab: builder.query<
      any[],
      { root_id?: string; limit?: number; offset?: number }
    >({
      async queryFn({ root_id, limit = 50, offset = 0 }) {
        let q = supabase
          .from("vocab")
          .select("*, root:roots(*)")
          .order("created_at", { ascending: false });

        if (root_id) q = q.eq("root_id", root_id);
        const { data, error } = (await q) as any;
        if (error) return showErrorToast(error);
        return { data: data ?? [] };
      },
      providesTags: [{ type: "Vocab", id: "LIST" }],
    }),

    // Senses
    listSenses: builder.query<
      SenseRow[],
      { vocab_id?: string; limit?: number; offset?: number }
    >({
      async queryFn({ vocab_id, limit = 50, offset = 0 }) {
        let q = supabase
          .from("vocab_senses")
          .select("*")
          .order("created_at", { ascending: false });

        if (vocab_id) q = q.eq("vocab_id", vocab_id);
        const { data, error } = await q;
        if (error) return showErrorToast(error);
        return { data: (data ?? []) as SenseRow[] };
      },
      providesTags: [{ type: "Senses", id: "LIST" }],
    }),

    // Examples
    listExamples: builder.query<
      ExampleRow[],
      { vocab_id?: string; limit?: number; offset?: number }
    >({
      async queryFn({ vocab_id, limit = 50, offset = 0 }) {
        let q = supabase
          .from("vocab_examples")
          .select("*")
          .order("created_at", { ascending: false });

        if (vocab_id) q = q.eq("vocab_id", vocab_id);
        const { data, error } = await q;
        if (error) return showErrorToast(error);
        return { data: (data ?? []) as ExampleRow[] };
      },
      providesTags: [{ type: "Examples", id: "LIST" }],
    }),

    // Vocab Sub Roots
    listVocabSubRoots: builder.query<
      VocabSubRootRow[],
      { vocab_id?: string; limit?: number; offset?: number }
    >({
      async queryFn({ vocab_id, limit = 50, offset = 0 }) {
        let q = supabase
          .from("vocab_sub_roots")
          .select("*, vocab:vocab(*)")
          .order("created_at", { ascending: false });

        if (vocab_id) q = q.eq("vocab_id", vocab_id);
        const { data, error } = (await q) as any;
        if (error) return showErrorToast(error);
        return { data: (data ?? []) as VocabSubRootRow[] };
      },
      providesTags: [{ type: "SubRoots", id: "LIST" }],
    }),

    // Sub Vocab with join to sub_root and vocab_sub_roots
    listSubVocab: builder.query<
      any[],
      { sub_root_id?: string; limit?: number; offset?: number }
    >({
      async queryFn({ sub_root_id, limit = 50, offset = 0 }) {
        let q = supabase
          .from("sub_vocab")
          .select("*, sub_root:vocab_sub_roots(*)")
          .order("created_at", { ascending: false });

        console.log("[listSubVocab] querying with sub_root_id:", sub_root_id);
        if (sub_root_id) q = q.eq("sub_root_id", sub_root_id);
        const { data, error } = (await q) as any;
        if (error) return showErrorToast(error);
        return { data: data ?? [] };
      },
      providesTags: [{ type: "SubVocab", id: "LIST" }],
    }),

    // Sub Vocab Senses
    listSubVocabSenses: builder.query<
      SubVocabSenseRow[],
      { sub_vocab_id?: string; limit?: number; offset?: number }
    >({
      async queryFn({ sub_vocab_id, limit = 50, offset = 0 }) {
        let q = supabase
          .from("sub_vocab_sense")
          .select("*")
          .order("created_at", { ascending: false });

        if (sub_vocab_id) q = q.eq("sub_vocab_id", sub_vocab_id);
        const { data, error } = await q;
        if (error) return showErrorToast(error);
        return { data: (data ?? []) as SubVocabSenseRow[] };
      },
      providesTags: [{ type: "SubSenses", id: "LIST" }],
    }),

    // Sub Vocab Examples
    listSubVocabExamples: builder.query<
      SubVocabExampleRow[],
      { sub_vocab_id?: string; limit?: number; offset?: number }
    >({
      async queryFn({ sub_vocab_id, limit = 50, offset = 0 }) {
        let q = supabase
          .from("sub_vocab_example")
          .select("*")
          .order("created_at", { ascending: false });

        if (sub_vocab_id) q = q.eq("sub_vocab_id", sub_vocab_id);
        const { data, error } = await q;
        if (error) return showErrorToast(error);
        return { data: (data ?? []) as SubVocabExampleRow[] };
      },
      providesTags: [{ type: "SubExamples", id: "LIST" }],
    }),

    // Mutations
    upsertRoot: builder.mutation<RootRow, Partial<RootRow>>({
      async queryFn(values) {
        const { data, error } = await supabase
          .from("roots")
          .upsert(values)
          .select("*")
          .limit(1);
        if (error) return showErrorToast(error);
        return { data: data?.[0] as RootRow };
      },
      invalidatesTags: [{ type: "Roots", id: "LIST" }],
    }),
    deleteRoot: builder.mutation<{ id: string }, { id: string }>({
      async queryFn({ id }) {
        const { error } = await supabase.from("roots").delete().eq("id", id);
        if (error) return showErrorToast(error);
        return { data: { id } };
      },
      // Deleting a root cascades to vocab and related data; refresh all dependent lists
      invalidatesTags: [
        { type: "Roots", id: "LIST" },
        { type: "Vocab", id: "LIST" },
        { type: "Senses", id: "LIST" },
        { type: "Examples", id: "LIST" },
        { type: "SubRoots", id: "LIST" },
        { type: "SubVocab", id: "LIST" },
        { type: "SubSenses", id: "LIST" },
        { type: "SubExamples", id: "LIST" },
      ],
    }),

    upsertVocab: builder.mutation<VocabRow, Partial<VocabRow>>({
      async queryFn(values) {
        const { data, error } = await supabase
          .from("vocab")
          .upsert(values)
          .select("*")
          .limit(1);
        if (error) return showErrorToast(error);
        return { data: data?.[0] as VocabRow };
      },
      invalidatesTags: [{ type: "Vocab", id: "LIST" }],
    }),
    deleteVocab: builder.mutation<{ id: string }, { id: string }>({
      async queryFn({ id }) {
        const { error } = await supabase.from("vocab").delete().eq("id", id);
        if (error) return showErrorToast(error);
        return { data: { id } };
      },
      // Deleting vocab affects vocab, senses, examples and sub-roots/sub-vocabs
      invalidatesTags: [
        { type: "Vocab", id: "LIST" },
        { type: "Senses", id: "LIST" },
        { type: "Examples", id: "LIST" },
        { type: "SubRoots", id: "LIST" },
        { type: "SubVocab", id: "LIST" },
        { type: "SubSenses", id: "LIST" },
        { type: "SubExamples", id: "LIST" },
      ],
    }),

    upsertSense: builder.mutation<SenseRow, Partial<SenseRow>>({
      async queryFn(values) {
        const { data, error } = await supabase
          .from("vocab_senses")
          .upsert(values)
          .select("*")
          .limit(1);
        if (error) return showErrorToast(error);
        return { data: data?.[0] as SenseRow };
      },
      invalidatesTags: [{ type: "Senses", id: "LIST" }],
    }),
    deleteSense: builder.mutation<{ id: string }, { id: string }>({
      async queryFn({ id }) {
        const { error } = await supabase
          .from("vocab_senses")
          .delete()
          .eq("id", id);
        if (error) return showErrorToast(error);
        return { data: { id } };
      },
      invalidatesTags: [{ type: "Senses", id: "LIST" }],
    }),

    upsertExample: builder.mutation<ExampleRow, Partial<ExampleRow>>({
      async queryFn(values) {
        const { data, error } = await supabase
          .from("vocab_examples")
          .upsert(values)
          .select("*")
          .limit(1);
        if (error) return showErrorToast(error);
        return { data: data?.[0] as ExampleRow };
      },
      invalidatesTags: [{ type: "Examples", id: "LIST" }],
    }),
    deleteExample: builder.mutation<{ id: string }, { id: string }>({
      async queryFn({ id }) {
        const { error } = await supabase
          .from("vocab_examples")
          .delete()
          .eq("id", id);
        if (error) return showErrorToast(error);
        return { data: { id } };
      },
      invalidatesTags: [{ type: "Examples", id: "LIST" }],
    }),

    upsertVocabSubRoot: builder.mutation<
      VocabSubRootRow,
      Partial<VocabSubRootRow>
    >({
      async queryFn(values) {
        const { data, error } = await supabase
          .from("vocab_sub_roots")
          .upsert(values)
          .select("*")
          .limit(1);
        if (error) return showErrorToast(error);
        return { data: data?.[0] as VocabSubRootRow };
      },
      invalidatesTags: [{ type: "SubRoots", id: "LIST" }],
    }),
    deleteVocabSubRoot: builder.mutation<{ id: string }, { id: string }>({
      async queryFn({ id }) {
        const { error } = await supabase
          .from("vocab_sub_roots")
          .delete()
          .eq("id", id);
        if (error) return showErrorToast(error);
        return { data: { id } };
      },
      // Deleting a vocab_sub_root affects sub-roots and sub-vocab under it
      invalidatesTags: [
        { type: "SubRoots", id: "LIST" },
        { type: "SubVocab", id: "LIST" },
        { type: "SubSenses", id: "LIST" },
        { type: "SubExamples", id: "LIST" },
      ],
    }),

    upsertSubVocab: builder.mutation<SubVocabRow, Partial<SubVocabRow>>({
      async queryFn(values) {
        console.log("[upsertSubVocab] values:", values);
        const { data, error } = await supabase
          .from("sub_vocab")
          .upsert(values)
          .select("*")
          .limit(1);
        if (error) return showErrorToast(error);
        return { data: data?.[0] as SubVocabRow };
      },
      invalidatesTags: [{ type: "SubVocab", id: "LIST" }],
    }),
    deleteSubVocab: builder.mutation<{ id: string }, { id: string }>({
      async queryFn({ id }) {
        const { error } = await supabase
          .from("sub_vocab")
          .delete()
          .eq("id", id);
        if (error) return showErrorToast(error);
        return { data: { id } };
      },
      // Deleting a sub_vocab impacts sub vocab list and its senses/examples
      invalidatesTags: [
        { type: "SubVocab", id: "LIST" },
        { type: "SubSenses", id: "LIST" },
        { type: "SubExamples", id: "LIST" },
      ],
    }),

    upsertSubVocabSense: builder.mutation<
      SubVocabSenseRow,
      Partial<SubVocabSenseRow>
    >({
      async queryFn(values) {
        const { data, error } = await supabase
          .from("sub_vocab_sense")
          .upsert(values)
          .select("*")
          .limit(1);
        if (error) return showErrorToast(error);
        return { data: data?.[0] as SubVocabSenseRow };
      },
      invalidatesTags: [{ type: "SubSenses", id: "LIST" }],
    }),
    deleteSubVocabSense: builder.mutation<{ id: string }, { id: string }>({
      async queryFn({ id }) {
        const { error } = await supabase
          .from("sub_vocab_sense")
          .delete()
          .eq("id", id);
        if (error) return showErrorToast(error);
        return { data: { id } };
      },
      invalidatesTags: [{ type: "SubSenses", id: "LIST" }],
    }),

    upsertSubVocabExample: builder.mutation<
      SubVocabExampleRow,
      Partial<SubVocabExampleRow>
    >({
      async queryFn(values) {
        const { data, error } = await supabase
          .from("sub_vocab_example")
          .upsert(values)
          .select("*")
          .limit(1);
        if (error) return showErrorToast(error);
        return { data: data?.[0] as SubVocabExampleRow };
      },
      invalidatesTags: [{ type: "SubExamples", id: "LIST" }],
    }),
    deleteSubVocabExample: builder.mutation<{ id: string }, { id: string }>({
      async queryFn({ id }) {
        const { error } = await supabase
          .from("sub_vocab_example")
          .delete()
          .eq("id", id);
        if (error) return showErrorToast(error);
        return { data: { id } };
      },
      invalidatesTags: [{ type: "SubExamples", id: "LIST" }],
    }),
  }),
});

export const {
  useListProfilesQuery,
  useDeleteProfileMutation,
  useBanProfileMutation,
  useListRootsQuery,
  useUpsertRootMutation,
  useDeleteRootMutation,
  useListVocabQuery,
  useUpsertVocabMutation,
  useDeleteVocabMutation,
  useListSensesQuery,
  useUpsertSenseMutation,
  useDeleteSenseMutation,
  useListExamplesQuery,
  useUpsertExampleMutation,
  useDeleteExampleMutation,
  useListVocabSubRootsQuery,
  useUpsertVocabSubRootMutation,
  useDeleteVocabSubRootMutation,
  useListSubVocabQuery,
  useUpsertSubVocabMutation,
  useDeleteSubVocabMutation,
  useListSubVocabSensesQuery,
  useUpsertSubVocabSenseMutation,
  useDeleteSubVocabSenseMutation,
  useListSubVocabExamplesQuery,
  useUpsertSubVocabExampleMutation,
  useDeleteSubVocabExampleMutation,
} = adminApi;
