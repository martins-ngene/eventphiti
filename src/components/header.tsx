import Link from "next/link";
import { Logo } from "./logo";

// STEP 1 · Replace the placeholder with Clerk's sign-in, sign-up and avatar menu.
export function Header() {
  return (
    <header className="top">
      <Link href="/" className="brand" aria-label="Eventphiti home"><Logo /></Link>
      <nav className="nav">
        <Link href="/dashboard" className="nav-link">My events</Link>
        <button type="button" className="btn" disabled title="Sign-in arrives in step 1">Sign in</button>
      </nav>
    </header>
  );
}
