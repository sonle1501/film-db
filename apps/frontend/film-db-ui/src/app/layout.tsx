import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import QueryProvider from '@/providers/query-provider';
import { Toaster } from 'react-hot-toast';

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FilmDB - Discover Your Next Favorite Film",
  description: "A premium movie database for exploring films, people, and creating custom watchlists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-surface-dark text-text-dark">
        <QueryProvider>
        {children}
        <Toaster position="bottom-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
