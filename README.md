# Eventphiti

**From Zero to Auth: Building Secure Applications with Clerk.** A workshop app for the Clerk meetup.

Create an event, share one link, and everyone in the room snaps photos with their phone. Every photo lands on a live wall the moment it's uploaded.

- **Next.js 16** for the app
- **Clerk** for sign-up, sign-in, Google login, protected routes and profiles
- **Supabase** for the database, photo storage and live updates. There's no separate backend: Supabase checks your Clerk token itself.

```
main      the finished app (= step-5)
start     the app with no auth at all: you can look, but you can't do anything
step-1 …  one tag per workshop step, so anyone who falls behind can catch up
```

Fell behind? `git stash && git checkout step-3` puts you at the end of step 3.

---

## Setup (do this before the workshop)

**1. Get the code**

```bash
git clone <repo-url> eventphiti && cd eventphiti
git checkout start
npm install
cp .env.example .env.local
```

**2. Clerk** (free)

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com). Leave Email switched on.
2. Copy the two keys from **API keys** into `.env.local`.

**3. Supabase** (free)

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the **Project URL** and the **publishable key** (or the legacy anon key) from **Project Settings → API** into `.env.local`.
3. Connect Clerk to Supabase:
   - In Clerk: **Integrations → Supabase → Activate**. Copy the **Clerk domain** it shows.
   - In Supabase: **Authentication → Sign In / Providers → Third-Party Auth → Add provider → Clerk**. Paste the domain.
4. Open **SQL Editor**, paste all of [`supabase/setup.sql`](supabase/setup.sql) and press **Run**. This creates the tables, the photo bucket, live updates and every access rule.

**4. Run it**

```bash
npm run dev
```

Open http://localhost:3000. You can browse, but you can't sign in or create anything yet. That's what the workshop is for.

---

## Step 1 · Sign up and sign in (about 6 min)

Clerk gives you the whole sign-up and sign-in flow, including email verification, as ready-made components.

**`src/app/layout.tsx`:** wrap the app in `<ClerkProvider>`.

```tsx
import { ClerkProvider } from "@clerk/nextjs";

<body>
  <ClerkProvider>
    <Header />
    {children}
  </ClerkProvider>
</body>
```

**`src/proxy.ts`** (new file). Next.js 16 calls it `proxy.ts`; older versions call it `middleware.ts`.

```ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

**`src/components/header.tsx`:** show buttons to guests and an avatar to signed-in users.

```tsx
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

<Show when="signed-out">
  <SignInButton mode="modal"><button className="btn ghost">Sign in</button></SignInButton>
  <SignUpButton mode="modal"><button className="btn">Sign up</button></SignUpButton>
</Show>
<Show when="signed-in">
  <UserButton />
</Show>
```

**`src/app/sign-in/[[...sign-in]]/page.tsx`** and **`src/app/sign-up/[[...sign-up]]/page.tsx`** (new): full-page versions for links and redirects.

```tsx
import { SignIn } from "@clerk/nextjs";
export default function SignInPage() {
  return <main className="auth-page"><SignIn /></main>;
}
```

**`src/lib/me.ts`:** tell the app who is signed in.

```ts
import { useUser } from "@clerk/nextjs";

export function useMe() {
  const { user, isLoaded } = useUser();
  if (!user) return { me: null, loaded: isLoaded };
  const name = user.fullName || user.username || user.primaryEmailAddress?.emailAddress.split("@")[0] || "Guest";
  return { me: { id: user.id, name, avatar: user.imageUrl ?? null }, loaded: isLoaded };
}
```

**`src/components/sign-in-cta.tsx`:** the "Sign in to snap" button opens Clerk's sign-in on top of the page.

```tsx
import { SignInButton } from "@clerk/nextjs";

<SignInButton mode="modal"><button className={className}>{label}</button></SignInButton>
```

✅ **Checkpoint:** sign up with your email. You appear under **Users** in the Clerk Dashboard.
Now try creating an event. **It fails.** You're signed in to the app, but the database still has no idea who you are. Hold that thought until step 4.

## Step 2 · Social login (about 1 min, zero code)

Clerk Dashboard → **SSO connections → Add connection → For all users → Google** (add GitHub too if you like).

Development instances use Clerk's shared Google credentials, so there's no Google Cloud setup.

✅ **Checkpoint:** sign out and sign back in with Google. On a phone, that's two taps.

## Step 3 · Protected routes (about 3 min)

The organizer pages should need an account. Event galleries stay open to anyone with the link.

**`src/proxy.ts`:**

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/profile(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});
```

✅ **Checkpoint:** open `/dashboard` in a private window. You're sent to sign in, then straight back.

## Step 4 · Let Supabase know who you are (about 5 min)

The database rules in `setup.sql` all ask one question: `auth.jwt()->>'sub'`. That's the Clerk user ID inside the token. Send the token and every rule starts working.

**`src/lib/supabase.ts`:**

```ts
import { useSession } from "@clerk/nextjs";

export function useSupabase() {
  const { session } = useSession();
  return useMemo(
    () =>
      createClient(SUPABASE_URL, SUPABASE_KEY, {
        async accessToken() {
          return (await session?.getToken()) ?? null;
        },
      }),
    [session],
  );
}
```

✅ **Checkpoint:** create an event, open it, snap a photo. It appears on the gallery and on the projector wall instantly.
**Authorization check:** sign in as someone else and try to delete a photo you didn't take. Supabase refuses. The organizer, though, can remove any photo from their own event.

## Step 5 · User profiles (about 3 min)

**`src/app/profile/[[...profile]]/page.tsx`** (new):

```tsx
import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <main className="page narrow-wide">
      <h1 className="h1">Your profile</h1>
      <UserProfile path="/profile" />
    </main>
  );
}
```

**`src/components/header.tsx`:** add it to the avatar menu.

```tsx
<UserButton>
  <UserButton.MenuItems>
    <UserButton.Link label="Your profile" href="/profile" labelIcon={<span>☺</span>} />
  </UserButton.MenuItems>
</UserButton>
```

✅ **Checkpoint:** change your name or photo, then snap again. Your new name and photo show under the picture.

---

## How the security works

| Question | Who answers it |
|---|---|
| Who are you? | Clerk: sign-up, sign-in, Google, email verification |
| Can you open this page? | `proxy.ts`: `/dashboard` and `/profile` need an account |
| Can you write this row or file? | Supabase rules in `setup.sql`, using the Clerk user ID from your token |

Uploaded photos are shrunk to 1600px on the phone before uploading (`src/lib/image.ts`), so a room full of phones doesn't overwhelm the Wi-Fi.

## Letting phones reach your laptop

Phones can't open `localhost`, and phone cameras and secure sign-in need HTTPS. Use a tunnel:

```bash
ngrok http --url=<your-static-domain> 3000
```

Share `https://<your-static-domain>/e/<event>`. The dashboard's QR codes use whatever address you opened it on, so open the dashboard through the ngrok link before showing a QR code.
