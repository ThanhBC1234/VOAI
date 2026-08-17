import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "../components/SiteHeader";
import { sitePath } from "../lib/site-path";
import "katex/dist/katex.min.css";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const dynamic = "force-static";

/**
 * SEO-P3-01: fallback phải là URL **công khai**.
 *
 * Trước đây khi thiếu `NEXT_PUBLIC_SITE_URL`, metadata trỏ tới một host xem
 * trước yêu cầu đăng nhập; kiểm tra ẩn danh trả HTTP 401, nên mọi social
 * crawler đều không lấy được ảnh. Cả hai workflow đều truyền biến này (CI dùng
 * `github.repository_owner`, Pages dùng `configure-pages`), nên fallback chỉ là
 * lưới an toàn cho bản dựng cục bộ — và vẫn phải là URL ai cũng mở được.
 */
const DEFAULT_PUBLIC_SITE_URL = "https://ditruyenhungvuong.github.io/voai-lab";
const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_PUBLIC_SITE_URL;
const metadataBase = new URL(publicSiteUrl);
const socialImage = new URL(sitePath("/og.png"), metadataBase).toString();
const title = "VOAI Lab — Lộ trình AI từ nền tảng đến thi đấu";
const description = "Lộ trình tự học VOAI cho học sinh THPT: hiểu sâu, tự code 90% và luyện thi trên phòng lab tương tác.";

export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  icons: {
    icon: sitePath("/favicon.svg"),
    shortcut: sitePath("/favicon.svg"),
  },
  openGraph: {
    title,
    description,
    type: "website",
    images: [{ url: socialImage, width: 1731, height: 909, alt: "VOAI Lab — Hiểu sâu, tự code, thi thật" }],
  },
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
};

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
