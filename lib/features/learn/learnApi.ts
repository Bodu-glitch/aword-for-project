import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Lesson } from "@/models/Lesson";

const supabaseBaseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_DOMAINS!,
  prepareHeaders: async (headers, { getState }) => {
    const state = getState() as RootState;
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
    getQuestions: builder.query<Lesson, void>({
      query: () => ({
        url: "/get_questions",
        method: "POST",
      }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetQuestionsQuery } = learnApi;
