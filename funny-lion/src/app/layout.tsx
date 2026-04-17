import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lucky Spin 🎰 - 룰렛",
  description: "행운의 룰렛 - 얼마를 받을 수 있을까요?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0a14]">{children}</body>
    </html>
  );
}
