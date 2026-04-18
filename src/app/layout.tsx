import type { Metadata, Viewport } from "next";
import {
  Noto_Sans_KR,
  Noto_Serif_KR,
  Nanum_Myeongjo,
  Gowun_Batang,
  Nanum_Pen_Script,
  Gowun_Dodum,
  Gaegu,
  Single_Day,
  East_Sea_Dokdo,
  Cute_Font,
  Black_Han_Sans,
  Jua,
} from "next/font/google";
import "./globals.css";

// 12종 한글 웹폰트 — 카테고리별로 정리
const notoSans = Noto_Sans_KR({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});
const notoSerif = Noto_Serif_KR({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});
const nanumMyeongjo = Nanum_Myeongjo({
  variable: "--font-nanum-myeongjo",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});
const gowunBatang = Gowun_Batang({
  variable: "--font-gowun-batang",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});
const nanumPen = Nanum_Pen_Script({
  variable: "--font-nanum-pen",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
const gowunDodum = Gowun_Dodum({
  variable: "--font-gowun-dodum",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
const gaegu = Gaegu({
  variable: "--font-gaegu",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});
const singleDay = Single_Day({
  variable: "--font-single-day",
  weight: "400",
  display: "swap",
});
const eastSeaDokdo = East_Sea_Dokdo({
  variable: "--font-east-sea",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
const cuteFont = Cute_Font({
  variable: "--font-cute",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
const blackHanSans = Black_Han_Sans({
  variable: "--font-black-han",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
const jua = Jua({
  variable: "--font-jua",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wedding-invitation-self-gamma.vercel.app"),
  title: "채종현 · 최수빈 결혼합니다",
  description: "2026년 11월 15일 일요일 오후 2시 · 테라리움 서울",
  openGraph: {
    title: "채종현 · 최수빈 결혼합니다",
    description: "2026년 11월 15일 일요일 오후 2시 · 테라리움 서울",
    type: "website",
    locale: "ko_KR",
    siteName: "모바일 청첩장",
  },
  twitter: {
    card: "summary_large_image",
    title: "채종현 · 최수빈 결혼합니다",
    description: "2026년 11월 15일 일요일 오후 2시 · 테라리움 서울",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f7eee6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVars = [
    notoSans.variable,
    notoSerif.variable,
    nanumMyeongjo.variable,
    gowunBatang.variable,
    nanumPen.variable,
    gowunDodum.variable,
    gaegu.variable,
    singleDay.variable,
    eastSeaDokdo.variable,
    cuteFont.variable,
    blackHanSans.variable,
    jua.variable,
  ].join(" ");

  return (
    <html lang="ko" className={`${fontVars} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
