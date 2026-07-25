import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 风向标｜每天两次，看见真正的热点",
  description:
    "融合 25 个编辑源与 Reddit、Hacker News、GitHub 等社区信号的 AI 热点简报。每天 08:00 与 20:00 更新。",
  openGraph: {
    title: "AI 风向标",
    description: "不是更多新闻，是更早看见风向。",
    type: "website",
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
