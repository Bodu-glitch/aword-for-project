import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Lesson, Question, Word } from "@/models/Lesson";

const supabaseBaseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_DOMAINS!,
  prepareHeaders: async (headers) => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    // console.log("Setting Authorization header with token:", accessToken);
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
    getNewWord: builder.query<Lesson, void>({
      query: () => ({
        url: "/get_new_words",
        method: "POST",
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
