import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANESTET® — профессиональный уход",
  description: "Интернет-магазин ANESTET®: профессиональные средства до, во время и после косметологических процедур.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeBootstrap = `(function(){try{var key="qk-design-lab-v1";var query=new URLSearchParams(location.search).get("design");var stored=localStorage.getItem(key);var requested=query||stored;var theme=requested==="clinical"?"clinical":requested==="cinematic"?"serum":matchMedia("(prefers-color-scheme: dark)").matches?"serum":"clinical";document.documentElement.dataset.theme=theme;}catch(error){document.documentElement.dataset.theme=matchMedia("(prefers-color-scheme: dark)").matches?"serum":"clinical";}})();`;
  return (
    <html lang="ru" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <link rel="preload" href="/assets/fonts/OpenSans-Critical-subset.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
