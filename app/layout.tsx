import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANESTET — профессиональный уход",
  description: "Интернет-магазин ANESTET: профессиональные средства до, во время и после косметологических процедур.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preload" href="/assets/fonts/OpenSans-Regular.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/fonts/Unbounded-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
