import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "../components/SiteHeader";
import "katex/dist/katex.min.css";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const localHost = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::|$)/.test(host);
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (localHost ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", base).toString();
  const title = "VOAI Lab — Lộ trình AI từ nền tảng đến thi đấu";
  const description = "Lộ trình tự học VOAI cho học sinh THPT: hiểu sâu, tự code 90% và luyện thi trên phòng lab tương tác.";
  return {
    metadataBase: base,
    title,
    description,
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: { title, description, type: "website", images: [{ url: socialImage, width: 1731, height: 909, alt: "VOAI Lab — Hiểu sâu, tự code, thi thật" }] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div><strong>VOAI Lab</strong><p>Lộ trình độc lập, không phải website chính thức của VOAI hoặc IOAI.</p></div>
          <div><span>15.08.2026 — 31.05.2027</span><span>290 phiên học · 145–297 giờ</span></div>
        </footer>
      </body>
    </html>
  );
}
