import type { Metadata } from "next";
import { Geist_Mono, Ubuntu } from "next/font/google";
import "./globals.css";

// Ubuntu has no 600, 800 or 900 weight, so headings that ask for them show at 700.
// latin-ext is included because it carries the rupee sign.
const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "vikas-sawant",
  description: "vikas-sawant management portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${ubuntu.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}