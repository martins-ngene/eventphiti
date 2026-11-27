"use client";

import { useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./supabase-public";

// STEP 4 · Right now Supabase can't tell who is writing, so the rules in setup.sql block every write.
// Pass Clerk's session token with each request to fix that.
export function useSupabase() {
  return useMemo(() => createClient(SUPABASE_URL, SUPABASE_KEY), []);
}
