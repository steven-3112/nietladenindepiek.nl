import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Niet Laden in de Piek - Help het energienet",
  description: "Ontdek hoe je jouw elektrische auto zo instelt dat deze niet laadt tussen 16:00 en 21:00 uur. Goed voor het energienet en de energietransitie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

