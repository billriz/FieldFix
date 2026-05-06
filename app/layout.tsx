import type { Metadata } from "next";

import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "FieldFix",
  description: "A production-ready FieldFix starter app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Navbar />
        <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
