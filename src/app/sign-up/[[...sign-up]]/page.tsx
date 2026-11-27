import { SignUp } from "@clerk/nextjs";

// STEP 1 · Clerk's sign-up, with email verification built in.
export default function SignUpPage() {
  return (
    <main className="auth-page">
      <SignUp />
    </main>
  );
}
