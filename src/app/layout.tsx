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
      path: "../fonts/noto-sans-jp/NotoSansJP-Variable.ttf",
      weight: "400 700",
      style: "normal",
    },
  ],
  variable: "--font-display-jp",
  display: "swap",
});

const messageFontJp = localFont({
  src: [
    {
      path: "../fonts/noto-sans-jp/NotoSansJP-Variable.ttf",
      weight: "400 700",
      style: "normal",
    },
  ],
  variable: "--font-message-jp",
  display: "swap",
});

const bodyFont = localFont({
  src: [
    {
      path: "../fonts/noto-sans-jp/NotoSansJP-Variable.ttf",
      weight: "400 700",
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
  // 検索エンジンには載せない（合言葉ゲートの裏側にサプライズ企画があること自体を
  // 検索結果に出さないため。コンテンツはミドルウェアで保護済みだが、タイトル・
  // descriptionだけでも検索結果に出るとMIKA本人が見つけてしまうリスクがある）
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Butterfly Garden for MIKA",
    description: "みんなの想いが蝶になって、MIKAのための特別なガーデンをつくります。",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${displayFont.variable} ${displayFontJp.variable} ${bodyFont.variable} ${messageFontJp.variable}`}>
      <body>
        <div className="mobile-frame">{children}</div>
      </body>
    </html>
  );
}
