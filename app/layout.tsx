import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-fengxiang-brief.vercel.app"),
  title: "AI 风向标｜风酱的热点手账",
  description:
    "融合 25 个编辑源与 Reddit、Hacker News、Digg 等社区信号的准实时 AI 热点雷达。每小时扫描，08:00 与 20:00 总结，并永久保留历史热点。",
  icons: {
    icon: [{ url: "/og.png", type: "image/png" }],
  },
  openGraph: {
    title: "AI 风向标｜风酱的热点手账",
    description: "每小时巡逻，达到阈值立即推送；每天 08:00 与 20:00 完整总结。",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1672,
        height: 941,
        alt: "AI 风向标动漫风格热点简报",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 风向标｜风酱的热点手账",
    description: "每小时巡逻，达到阈值立即推送；每天 08:00 与 20:00 完整总结。",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
