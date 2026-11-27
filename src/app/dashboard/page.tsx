"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useMe } from "@/lib/me";
import { useSupabase } from "@/lib/supabase";
import { publicSupabase, type EventRow } from "@/lib/supabase-public";
import { slugify } from "@/lib/image";
import { SignInCta } from "@/components/sign-in-cta";
import { explain } from "@/lib/errors";

export default function Dashboard() {
  const { me, loaded } = useMe();
  const supabase = useSupabase();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  useEffect(() => {
    if (!me) return;
    publicSupabase
      .from("events")
      .select("*")
      .eq("owner_id", me.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setEvents((data as EventRow[]) ?? []));
  }, [me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Give your event a name first.");
    setBusy(true);
    setError(null);
    const { data, error } = await supabase
      .from("events")
      .insert({ name: name.trim(), slug: slugify(name) })
      .select()
      .single();
    setBusy(false);
    if (error) return setError(explain(error.message));
    setEvents((list) => [data as EventRow, ...list]);
    setName("");
  }

  if (!loaded) return <main className="page"><p className="muted">Loading…</p></main>;

  if (!me) {
    return (
      <main className="page narrow">
        <h1 className="h1">Your events</h1>
        <div className="card empty">
          <p>Sign in to create an event and get its share link.</p>
          <SignInCta label="Sign in to continue" />
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="hello">
        {me.avatar && <img src={me.avatar} alt="" className="avatar lg" />}
        <div>
          <h1 className="h1">Hi {me.name.split(" ")[0]}, here are your events</h1>
          <p className="muted">Create one, then share the link or QR code with your guests.</p>
        </div>
      </div>

      <form className="card create" onSubmit={createEvent}>
        <label htmlFor="ev-name">New event</label>
        <div className="row">
          <input id="ev-name" value={name} onChange={(e) => { setName(e.target.value); setError(null); }} placeholder="Clerk Meetup Lagos" maxLength={80} />
          <button className="btn" disabled={busy}>{busy ? "Creating…" : "Create event"}</button>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
      </form>

      {events.length === 0 ? (
        <p className="muted center">No events yet. Your first one is a name away.</p>
      ) : (
        <ul className="events">
          {events.map((ev) => {
            const link = `${origin}/e/${ev.slug}`;
            return (
              <li key={ev.id} className="card event">
                <div className="qr"><QRCodeSVG value={link} size={112} marginSize={1} /></div>
                <div className="event-body">
                  <h2>{ev.name}</h2>
                  <p className="mono link">{link}</p>
                  <div className="row">
                    <CopyButton text={link} />
                    <Link className="btn ghost" href={`/e/${ev.slug}`}>Open gallery</Link>
                    <Link className="btn ghost" href={`/e/${ev.slug}?wall=1`}>Projector wall</Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch {}
      }}
    >
      {done ? "Copied" : "Copy link"}
    </button>
  );
}
