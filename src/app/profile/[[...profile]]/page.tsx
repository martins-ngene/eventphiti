import { UserProfile } from "@clerk/nextjs";

// STEP 5 · A full profile page: name, photo, emails, connected accounts, security.
// The name and photo you set here are what appear under your photos on the wall.
export default function ProfilePage() {
  return (
    <main className="page narrow-wide">
      <h1 className="h1">Your profile</h1>
      <p className="lede">Your name and photo show up under every picture you add.</p>
      <UserProfile path="/profile" />
    </main>
  );
}
