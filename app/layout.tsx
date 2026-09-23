import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "NinjaSwiper",
  description:
    "Set your Tinder swipe timing, Like percentage, breaks, and Passport cities. Try NinjaSwiper free for 200 swipes, then upgrade for unlimited use.",
  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    shortcut: "/icon.png",
    apple: [
      {
        url: "/icon.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
