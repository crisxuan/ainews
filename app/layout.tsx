import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-fengxiang-brief.vercel.app"),
  title: "AI 风向标｜风酱的热点手账",
  description:
    "融合 25 个编辑源与 Reddit、Hacker News、GitHub 等社区信号的 AI 热点简报。每天 08:00 与 20:00 更新。",
  openGraph: {
    title: "AI 风向标｜风酱的热点手账",
    description: "每天两次，捕捉真正的热点。",
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
    description: "每天两次，捕捉真正的热点。",
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
