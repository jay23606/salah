import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Salat Campus — UNILAG",
  description:
    "Prayer times for UNILAG computed offline, and a check of which lectures collide with which prayer window.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
