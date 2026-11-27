"use client";

import { SignInButton } from "@clerk/nextjs";

// STEP 1 · Clerk's sign-in, opened right where the guest is standing.
export function SignInCta({ label, className = "btn" }: { label: string; className?: string }) {
  return (
    <SignInButton mode="modal">
      <button type="button" className={className}>{label}</button>
    </SignInButton>
  );
}
