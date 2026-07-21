import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Qorx Zero — Keep the context. Send the proof.",
  description:
    "Local project memory for Codex. Keep context on your device and send GPT-5.6 only the evidence needed now.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Qorx Zero",
    description: "Keep the context. Send the proof.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qorx Zero",
    description: "Keep the context. Send the proof.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
