import { SignIn } from "@clerk/nextjs";

// STEP 1 · Clerk's sign-in: email, password, and any social logins you switch on.
export default function SignInPage() {
  return (
    <main className="auth-page">
      <SignIn />
    </main>
  );
}
