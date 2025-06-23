import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 漫畫生成器 - 使用 Gemini AI 創作漫畫",
  description: "使用 Gemini AI 將您的想法轉換成精美的漫畫分鏡。支援多種漫畫風格，包括少年漫畫、韓式漫畫、黑白畫風、Q版等。",
  keywords: "漫畫生成器, AI 漫畫, Gemini AI, 漫畫創作, 分鏡生成",
  openGraph: {
    title: "AI 漫畫生成器",
    description: "使用 AI 創作獨特的漫畫作品",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
