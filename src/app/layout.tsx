import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
        {/* STEP 1 · ClerkProvider gives every page access to the signed-in user */}
        <ClerkProvider
          appearance={{
            variables: { colorPrimary: "#ff4f3d", colorForeground: "#16121f", borderRadius: "14px" },
          }}
        >
          <Header />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
