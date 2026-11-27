"use client";

import { useUser } from "@clerk/nextjs";

export type Me = { id: string; name: string; avatar: string | null };

// STEP 1 · Who is using the app right now, straight from Clerk.
export function useMe(): { me: Me | null; loaded: boolean } {
  const { user, isLoaded } = useUser();
  if (!user) return { me: null, loaded: isLoaded };
  const name =
    user.fullName || user.username || user.primaryEmailAddress?.emailAddress.split("@")[0] || "Guest";
  return { me: { id: user.id, name, avatar: user.imageUrl ?? null }, loaded: isLoaded };
}
