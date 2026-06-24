import type { Metadata } from "next";
import { Cormorant_Garamond, Shippori_Mincho, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const displayFontJp = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display-jp",
  display: "swap",
});

const bodyFont = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Butterfly Garden for MIKA",
  description:
    "みんなの想いが蝶になって、MIKAのための特別なガーデンをつくります。ファンが届けるバースデーギフト企画です。",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${displayFont.variable} ${displayFontJp.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
