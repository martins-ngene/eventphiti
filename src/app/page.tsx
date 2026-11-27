import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">For meetups, weddings, launches, classes</p>
          <h1 className="display">Every photo from your event. <span className="flash">One live wall.</span></h1>
          <p className="lede">Create an event, share one link, and everyone in the room snaps straight into the same gallery. It updates on the big screen as the photos land.</p>
          <div className="row">
            <Link href="/dashboard" className="btn big">Start an event</Link>
            <a href="#how" className="btn ghost big">How it works</a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="polaroid p1"><span /></div>
          <div className="polaroid p2"><span /></div>
          <div className="polaroid p3"><span /></div>
          <div className="phone-mini">
            <div className="shutter" />
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <ol className="steps">
          <li><b>1</b><h3>Create an event</h3><p>Sign in, name your event and get a link plus a QR code.</p></li>
          <li><b>2</b><h3>Share the link</h3><p>Put the QR code on the screen or drop the link in your community chat.</p></li>
          <li><b>3</b><h3>Everyone snaps</h3><p>Guests sign in with Google in two taps and take photos with their phone camera.</p></li>
          <li><b>4</b><h3>Watch the wall</h3><p>Every photo appears on the live wall the moment it’s uploaded.</p></li>
        </ol>
        <p className="built">Built live at the Clerk meetup with Next.js, Clerk and Supabase.</p>
      </section>
    </main>
  );
}
