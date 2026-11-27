-- Eventphiti: run this once in Supabase → SQL Editor.
-- Before running it: Supabase → Authentication → Sign In / Providers → Third-Party Auth → add Clerk
-- (paste your Clerk domain from Clerk Dashboard → Integrations → Supabase).
--
-- Who is signed in? Clerk's session token arrives with every request, and
-- auth.jwt()->>'sub' is the Clerk user id (user_...). Every rule below uses it.

-- ── Events ──────────────────────────────────────────────────────────────
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null check (char_length(name) between 1 and 80),
  owner_id    text not null default (auth.jwt()->>'sub'),
  created_at  timestamptz not null default now()
);

alter table public.events enable row level security;

-- Anyone with the link can see an event.
create policy "events are public"
  on public.events for select
  to anon, authenticated
  using (true);

-- Only signed-in users can create events, and only as themselves.
create policy "create your own events"
  on public.events for insert
  to authenticated
  with check (owner_id = (auth.jwt()->>'sub'));

-- Only the organizer can delete their event.
create policy "organizers delete their events"
  on public.events for delete
  to authenticated
  using (owner_id = (auth.jwt()->>'sub'));

-- ── Photos ──────────────────────────────────────────────────────────────
create table if not exists public.photos (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events(id) on delete cascade,
  user_id         text not null default (auth.jwt()->>'sub'),
  uploader_name   text,
  uploader_avatar text,
  path            text not null,
  created_at      timestamptz not null default now()
);

create index if not exists photos_event_created on public.photos (event_id, created_at desc);

alter table public.photos enable row level security;

-- The gallery is public to anyone with the event link.
create policy "photos are public"
  on public.photos for select
  to anon, authenticated
  using (true);

-- Signed-in guests can add photos, only as themselves.
create policy "add your own photos"
  on public.photos for insert
  to authenticated
  with check (user_id = (auth.jwt()->>'sub'));

-- You can delete your own photo; the organizer can delete any photo in their event.
create policy "delete own photos or moderate your event"
  on public.photos for delete
  to authenticated
  using (
    user_id = (auth.jwt()->>'sub')
    or exists (
      select 1 from public.events e
      where e.id = photos.event_id and e.owner_id = (auth.jwt()->>'sub')
    )
  );

-- ── Live gallery ────────────────────────────────────────────────────────
-- Sends new and deleted photos to every open gallery instantly.
alter publication supabase_realtime add table public.photos;

-- ── Photo files (Storage) ───────────────────────────────────────────────
-- Files live at photos/<event_id>/<clerk_user_id>/<random>.jpg
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Upload only into your own folder.
create policy "upload into your own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[2] = (auth.jwt()->>'sub')
  );

-- Delete your own files, or any file in an event you organize.
create policy "delete own files or moderate your event"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and (
      (storage.foldername(name))[2] = (auth.jwt()->>'sub')
      or exists (
        select 1 from public.events e
        where e.id::text = (storage.foldername(name))[1]
          and e.owner_id = (auth.jwt()->>'sub')
      )
    )
  );
