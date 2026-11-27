"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useMe } from "@/lib/me";
import { useSupabase } from "@/lib/supabase";
import { publicSupabase, photoUrl, type EventRow, type PhotoRow } from "@/lib/supabase-public";
import { shrinkImage } from "@/lib/image";
import { explain } from "@/lib/errors";
import { SignInCta } from "@/components/sign-in-cta";

type Upload = { id: string; name: string; state: "working" | "done" | "failed"; note?: string };

export function EventRoom({ event, wall }: { event: EventRow; wall: boolean }) {
  const { me } = useMe();
  const supabase = useSupabase();
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [fresh, setFresh] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const [open, setOpen] = useState<PhotoRow | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const isOrganizer = !!me && me.id === event.owner_id;

  useEffect(() => setLink(`${window.location.origin}/e/${event.slug}`), [event.slug]);

  // Load the gallery, then listen for new and deleted photos in real time.
  useEffect(() => {
    let alive = true;
    publicSupabase
      .from("photos")
      .select("*")
      .eq("event_id", event.id)
      .order("created_at", { ascending: false })
      .limit(300)
      .then(({ data }) => {
        if (!alive) return;
        setPhotos((data as PhotoRow[]) ?? []);
        setLoading(false);
      });

    const channel = publicSupabase
      .channel(`photos:${event.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "photos", filter: `event_id=eq.${event.id}` },
        (payload) => {
          const row = payload.new as PhotoRow;
          setPhotos((list) => (list.some((p) => p.id === row.id) ? list : [row, ...list]));
          setFresh(row.id);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "photos" },
        (payload) => {
          const id = (payload.old as { id?: string }).id;
          if (id) setPhotos((list) => list.filter((p) => p.id !== id));
        },
      )
      .subscribe();

    return () => {
      alive = false;
      publicSupabase.removeChannel(channel);
    };
  }, [event.id]);

  async function addPhotos(files: FileList | null) {
    if (!files || !me) return;
    for (const file of Array.from(files)) {
      const id = crypto.randomUUID();
      setUploads((u) => [{ id, name: file.name, state: "working" as const }, ...u].slice(0, 6));
      const set = (state: Upload["state"], note?: string) =>
        setUploads((u) => u.map((x) => (x.id === id ? { ...x, state, note } : x)));
      try {
        const blob = await shrinkImage(file);
        const path = `${event.id}/${me.id}/${id}.jpg`;
        const up = await supabase.storage.from("photos").upload(path, blob, { contentType: "image/jpeg" });
        if (up.error) throw up.error;
        const { data, error } = await supabase
          .from("photos")
          .insert({ event_id: event.id, path, uploader_name: me.name, uploader_avatar: me.avatar })
          .select()
          .single();
        if (error) throw error;
        const row = data as PhotoRow;
        setPhotos((list) => (list.some((p) => p.id === row.id) ? list : [row, ...list]));
        setFresh(row.id);
        set("done");
      } catch (err) {
        set("failed", explain(err instanceof Error ? err.message : String(err)));
      }
    }
    if (input.current) input.current.value = "";
  }

  async function remove(photo: PhotoRow) {
    const { data, error } = await supabase.from("photos").delete().eq("id", photo.id).select("id");
    if (error) return alertInline(explain(error.message));
    // A delete the rules don't allow returns no rows instead of an error.
    if (!data?.length) return alertInline("Only the photo's owner or the event organizer can remove it.");
    await supabase.storage.from("photos").remove([photo.path]);
    setPhotos((list) => list.filter((p) => p.id !== photo.id));
    setOpen(null);
  }

  function alertInline(note: string) {
    setUploads((u) => [{ id: crypto.randomUUID(), name: "Delete", state: "failed" as const, note }, ...u].slice(0, 6));
  }

  const canDelete = (p: PhotoRow) => !!me && (isOrganizer || p.user_id === me.id);

  if (wall) {
    return (
      <main className="wall">
        <aside className="wall-side">
          <p className="kicker light">Live wall</p>
          <h1>{event.name}</h1>
          {link && (
            <div className="wall-qr">
              <QRCodeSVG value={link} size={220} marginSize={2} />
            </div>
          )}
          <p className="wall-cta">Scan, sign in, snap.</p>
          <p className="wall-count"><b>{photos.length}</b> {photos.length === 1 ? "photo" : "photos"} so far</p>
          <Link href={`/e/${event.slug}`} className="wall-exit">Leave wall view</Link>
        </aside>
        <section className="wall-grid" aria-live="polite">
          {photos.length === 0 && !loading && <p className="wall-empty">Waiting for the first photo…</p>}
          {photos.map((p) => (
            <figure key={p.id} className={p.id === fresh ? "shot pop" : "shot"}>
              <img src={photoUrl(p.path)} alt={`Photo by ${p.uploader_name ?? "a guest"}`} loading="lazy" />
              <figcaption>
                {p.uploader_avatar && <img src={p.uploader_avatar} alt="" className="avatar" />}
                {p.uploader_name ?? "Guest"}
              </figcaption>
            </figure>
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="room-head">
        <div>
          <p className="kicker">{isOrganizer ? "You're the organizer" : "Event gallery"}</p>
          <h1 className="h1">{event.name}</h1>
          <p className="muted">{photos.length} {photos.length === 1 ? "photo" : "photos"} · updates live</p>
        </div>
        <div className="row">
          <Link href={`/e/${event.slug}?wall=1`} className="btn ghost">Projector wall</Link>
        </div>
      </section>

      <section className="snap card">
        {me ? (
          <>
            <input
              ref={input}
              id="camera"
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="sr-only"
              onChange={(e) => addPhotos(e.target.files)}
            />
            <label htmlFor="camera" className="shutter-btn">
              <span className="shutter-dot" aria-hidden="true" />
              Snap a photo
            </label>
            <p className="muted small">Posting as {me.name}. On a laptop this opens your files.</p>
          </>
        ) : (
          <>
            <p><b>Want to add your photos?</b> Sign in. It takes two taps with Google.</p>
            <SignInCta label="Sign in to snap" className="btn big" />
          </>
        )}
        {uploads.length > 0 && (
          <ul className="uploads">
            {uploads.map((u) => (
              <li key={u.id} className={u.state}>
                <span>{u.state === "working" ? "Uploading…" : u.state === "done" ? "On the wall ✓" : "Didn't upload"}</span>
                {u.note && <small>{u.note}</small>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {loading ? (
        <p className="muted center">Loading photos…</p>
      ) : photos.length === 0 ? (
        <p className="muted center">No photos yet. Be the first.</p>
      ) : (
        <section className="grid">
          {photos.map((p) => (
            <button key={p.id} type="button" className={p.id === fresh ? "shot pop" : "shot"} onClick={() => setOpen(p)}>
              <img src={photoUrl(p.path)} alt={`Photo by ${p.uploader_name ?? "a guest"}`} loading="lazy" />
              <span className="by">
                {p.uploader_avatar && <img src={p.uploader_avatar} alt="" className="avatar" />}
                {p.uploader_name ?? "Guest"}
              </span>
            </button>
          ))}
        </section>
      )}

      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo" onClick={() => setOpen(null)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img src={photoUrl(open.path)} alt={`Photo by ${open.uploader_name ?? "a guest"}`} />
            <div className="row between">
              <span className="by static">
                {open.uploader_avatar && <img src={open.uploader_avatar} alt="" className="avatar" />}
                {open.uploader_name ?? "Guest"}
              </span>
              <div className="row">
                {canDelete(open) && (
                  <button type="button" className="btn danger" onClick={() => remove(open)}>
                    {isOrganizer && open.user_id !== me?.id ? "Remove from event" : "Delete my photo"}
                  </button>
                )}
                <button type="button" className="btn ghost" onClick={() => setOpen(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
