"use client";

import { useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { SUPABASE_KEY, SUPABASE_URL } from "./supabase-public";

// STEP 4 · Every write carries the Clerk session token.
// Supabase reads auth.jwt()->>'sub' from it, and the rules in setup.sql decide what you may do.
export function useSupabase() {
  const { session } = useSession();
  return useMemo(
    () =>
      createClient(SUPABASE_URL, SUPABASE_KEY, {
        async accessToken() {
          return (await session?.getToken()) ?? null;
        },
      }),
    [session],
  );
}
