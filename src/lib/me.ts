"use client";

export type Me = { id: string; name: string; avatar: string | null };

// STEP 1 · Nobody can sign in yet, so there is never a current user.
// Replace this with Clerk's useUser().
export function useMe(): { me: Me | null; loaded: boolean } {
  return { me: null, loaded: true };
}
