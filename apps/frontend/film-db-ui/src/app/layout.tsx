import type { Metadata } from "next";
import { Inter, Share_Tech_Mono } from "next/font/google";
import QueryProvider from '@/providers/query-provider';
import { Toaster } from 'react-hot-toast';

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "FILM-DB",
  description: "A cyberpunk-terminal database for exploring films, people, and datasets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${shareTechMono.variable} h-full antialiased dark`}
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
