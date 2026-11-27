# Run sheet: From Zero to Auth (30 minutes)

The room uses the finished app first, then you rebuild its auth live in five steps.

## Setup: two copies of the same repo

| Folder | Branch | Port | Used for |
|---|---|---|---|
| `eventphiti-live` | `main` | 3000, through ngrok | The hook and the payoff. The room's phones use this one. |
| `eventphiti` | `start` | 3001, laptop only | Live coding |

Both use the **same** Clerk application and the **same** Supabase project, so users and events show up in both.

```bash
# Terminal 1: the live copy
cd eventphiti-live && npm run dev -- -p 3000
# Terminal 2: the tunnel
ngrok http --url=<your-static-domain> 3000
# Terminal 3: the copy you code in
cd eventphiti && git checkout start && npm run dev -- -p 3001
```

## Before you go on stage

- [ ] `supabase/setup.sql` has been run, and Clerk is added under Supabase → Third-Party Auth
- [ ] Google is switched on in Clerk → SSO connections
- [ ] **Phone test on the ngrok link:** sign in with Google, snap, and see the photo appear on the wall. This is the one test that matters.
- [ ] Event created in the live copy (opened through the ngrok link so its QR code points there)
- [ ] Projector wall open: `https://<domain>/e/<slug>?wall=1`
- [ ] Editor open in `eventphiti` at `start`, font size turned up, `README.md` open in a second tab
- [ ] Second browser profile signed in as a different user (for the "you can't delete that" demo)
- [ ] Phone hotspot ready in case the Wi-Fi struggles
- [ ] `node_modules` already installed in both copies (never `npm install` on venue Wi-Fi)

## Timeline

| Time | What happens | Screen |
|---|---|---|
| **0:00–3:00** | **Hook.** "Scan this, sign in with Google, take a photo of the person next to you." Photos start popping onto the wall. | Projector wall |
| **3:00–4:00** | "Everything you just did is five steps of Clerk. Let's build it." Show the `start` app: you can look, but you can't sign in. | localhost:3001 |
| **4:00–10:00** | **Step 1 · Sign up / sign in.** `ClerkProvider`, `proxy.ts`, header, sign-in pages, `useUser`. Sign up live. Then try creating an event: **it fails.** "The app knows me. The database doesn't. Remember that." | Editor + browser |
| **10:00–11:00** | **Step 2 · Social login.** Toggle Google in the dashboard. Sign in with Google. No code at all. | Clerk Dashboard |
| **11:00–14:00** | **Step 3 · Protected routes.** `createRouteMatcher` + `auth.protect()`. Open `/dashboard` in a private window and get redirected. | Editor + private window |
| **14:00–20:00** | **Step 4 · The aha moment.** Show one rule in `setup.sql` (`owner_id = auth.jwt()->>'sub'`). Add `accessToken` to `useSupabase`. Create the event again: it works. Snap a photo from the laptop. | Editor + SQL |
| **20:00–23:00** | **Step 5 · Profiles.** `/profile` with `<UserProfile />`, plus the menu link. Change your display name; the next photo shows it. | Browser |
| **23:00–26:00** | **Payoff.** Back to the live wall and its photo count. As the organizer, remove a photo. In the second browser profile, try to delete someone else's photo and get refused by Supabase. | Projector wall |
| **26:00–30:00** | Questions. Show the repo link or QR code: "`git checkout start` and do it yourself tonight." | |

## If something breaks

- **A step won't compile:** `git stash && git checkout step-N` and carry on. Say "this is why we have checkpoints."
- **Phones can't sign in:** keep going on the laptop. The wall still updates live from laptop uploads.
- **Wi-Fi is struggling:** switch the laptop to the hotspot. Photos are already shrunk to about 300 KB on the phone.
- **Running short on time:** skip step 5. Step 4 is the one that teaches the most.

## Lines worth saying

- "Clerk answers *who are you*. The database answers *what may you do*. The token is how they talk."
- "There's no backend in this app. Supabase reads the Clerk token and enforces the rules itself."
- "Development instances get Google login for free; production needs your own Google credentials."
