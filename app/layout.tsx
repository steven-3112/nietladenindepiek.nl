import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Niet laden in de piek - Laadtijden instellen elektrische auto",
  description: "Ontdek hoe je jouw elektrische auto zo instelt dat deze niet laadt tijdens piekuren (16:00-21:00). Handleidingen voor Tesla, VW, BMW en meer. Goed voor het energienet en de energietransitie.",
  keywords: "elektrische auto, laadtijden, piekuren, energienet, energietransitie, Tesla, Volkswagen, BMW, EV laden",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: "Niet laden in de piek - Help het energienet",
    description: "Leer hoe je jouw elektrische auto slim laadt buiten piekuren",
    type: "website",
    locale: "nl_NL",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

