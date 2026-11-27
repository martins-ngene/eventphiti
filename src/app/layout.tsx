import type { Metadata, Viewport } from "next";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eventphiti · every photo from your event, live",
  description: "Share one link. Everyone snaps. Every photo lands on one live wall.",
};

export const viewport: Viewport = { themeColor: "#16121f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* STEP 1 · wrap everything in <ClerkProvider> */}
        <Header />
        {children}
      </body>
    </html>
  );
}
