import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase";
import { Lesson, Question, Word } from "@/models/Lesson";

const supabaseBaseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_DOMAINS!,
  prepareHeaders: async (headers) => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (data?.session?.access_token) {
      headers.set("Authorization", `Bearer ${data.session.access_token}`);
    }
    return headers;
  },
});

export const learnApi = createApi({
  reducerPath: "learnApi",
  baseQuery: supabaseBaseQuery,
  endpoints: (builder) => ({
    getNewWord: builder.query<
      Lesson,
      {
        rootId: string;
        wordCount: number;
      }
    >({
      query: ({ rootId, wordCount }) => ({
        url: "/get_new_words_v2",
        method: "POST",
        body: { rootId, limit: wordCount },
      }),
      keepUnusedDataFor: 0,
    }),
    getQuestions: builder.query<
      {
        questions: Question[];
      },
      { words: Word[] }
    >({
      query: (words) => ({
        url: "/get_questions",
        method: "POST",
        body: {
          allSenses: words,
        },
      }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetQuestionsQuery, useGetNewWordQuery } = learnApi;
