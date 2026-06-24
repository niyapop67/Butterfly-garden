import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const displayFont = localFont({
  src: [
    {
      path: "../fonts/cormorant-garamond/CormorantGaramond-Variable.ttf",
      weight: "400 600",
      style: "normal",
    },
    {
      path: "../fonts/cormorant-garamond/CormorantGaramond-Italic-Variable.ttf",
      weight: "400 600",
      style: "italic",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

const displayFontJp = localFont({
  src: [
    {
      path: "../fonts/shippori-mincho/ShipporiMincho-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/shippori-mincho/ShipporiMincho-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/shippori-mincho/ShipporiMincho-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-display-jp",
  display: "swap",
});

const bodyFont = localFont({
  src: [
    {
      path: "../fonts/zen-maru-gothic/ZenMaruGothic-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/zen-maru-gothic/ZenMaruGothic-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/zen-maru-gothic/ZenMaruGothic-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
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
