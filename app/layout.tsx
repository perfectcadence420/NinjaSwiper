import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
 title: "NinjaSwiper",
 description: "Smart Tinder automation with API-key access, trial swipes, and Premium subscription support.",
 icons: {
 icon: "/icon.png",
 apple: "/icon.png"
 }
};

export const viewport: Viewport = {
 width: "device-width",
 initialScale: 1,
 maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="en">
 <body>{children}</body>
 </html>
 );
}
