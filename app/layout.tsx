import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANESTET — профессиональный уход",
  description: "Интернет-магазин ANESTET: профессиональные средства до, во время и после косметологических процедур.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
