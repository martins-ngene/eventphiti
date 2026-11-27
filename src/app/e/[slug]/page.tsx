import { notFound } from "next/navigation";
import { publicSupabase, type EventRow } from "@/lib/supabase-public";
import { EventRoom } from "./event-room";

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ wall?: string }>;
}) {
  const { slug } = await params;
  const { wall } = await searchParams;
  const { data: event } = await publicSupabase.from("events").select("*").eq("slug", slug).maybeSingle();
  if (!event) notFound();
  return <EventRoom event={event as EventRow} wall={wall === "1"} />;
}
