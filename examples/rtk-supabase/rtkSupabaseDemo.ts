# @ts-nocheck
/* eslint-disable */
// Example: RTK Query endpoint that makes multiple sequential Supabase calls
// - First: count rows in a table
// - Second: pick a random row by offset
//
// This is a standalone demo for reference; adapt naming/paths to your app.

import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase"; // or import your client from the correct path

export type DemoRow = {
  id: string;
  word: string;
};

type DemoError = { message: string; code?: string };

export const demoApi = createApi({
  reducerPath: "demoApi",
  baseQuery: fakeBaseQuery<DemoError>(),
  endpoints: (builder) => ({
    getRandomRow: builder.query<DemoRow | null, { table?: string } | void>({
      async queryFn(arg) {
        try {
          const table = arg?.table ?? "vocab";

          // 1) Count rows
          const { count, error: countError } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });
          if (countError || !count || count === 0) {
            return {
              error: {
                message: countError?.message || `No rows in table ${table}`,
                code: countError?.code ?? "COUNT_ERROR",
              },
            };
          }

          // 2) Choose random offset and fetch exactly 1 row
          const randomOffset = Math.floor(Math.random() * count);
          const { data, error } = await supabase
            .from(table)
            .select("*")
            .range(randomOffset, randomOffset)
            .limit(1);
          if (error) {
            return { error: { message: error.message, code: error.code } };
          }

          return { data: data?.[0] ?? null };
        } catch (e: any) {
          return { error: { message: e?.message ?? "Unknown", code: "UNKNOWN" } };
        }
      },
    }),
  }),
});

export const { useGetRandomRowQuery } = demoApi;

