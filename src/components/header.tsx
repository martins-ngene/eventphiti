import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Logo } from "./logo";

// STEP 1 · Signed-out guests see the buttons; signed-in users see their avatar menu.
export function Header() {
  return (
    <header className="top">
      <Link href="/" className="brand" aria-label="Eventphiti home"><Logo /></Link>
      <nav className="nav">
        <Link href="/dashboard" className="nav-link">My events</Link>
        <Show when="signed-out">
          <SignInButton mode="modal"><button type="button" className="btn ghost">Sign in</button></SignInButton>
          <SignUpButton mode="modal"><button type="button" className="btn">Sign up</button></SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </nav>
    </header>
  );
}
