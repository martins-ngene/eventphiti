"use client";

// STEP 1 · Swap this placeholder for Clerk's <SignInButton mode="modal">.
export function SignInCta({ label, className = "btn" }: { label: string; className?: string }) {
  return (
    <button type="button" className={className} disabled title="Sign-in arrives in step 1">
      {label}
    </button>
  );
}
