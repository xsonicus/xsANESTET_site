import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANESTET — профессиональный уход",
  description: "Интернет-магазин ANESTET: профессиональные средства до, во время и после косметологических процедур.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/assets/fonts/OpenSans-Critical-subset.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
