import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

// Anyone can read events and photos, signed in or not (see supabase/setup.sql).
// This client never sends a user token, so it's used for reading and live updates.
export const publicSupabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type EventRow = { id: string; slug: string; name: string; owner_id: string; created_at: string };
export type PhotoRow = {
  id: string;
  event_id: string;
  user_id: string;
  uploader_name: string | null;
  uploader_avatar: string | null;
  path: string;
  created_at: string;
};

export function photoUrl(path: string) {
  return publicSupabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
}
