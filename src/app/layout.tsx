import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aegis — Industrial Knowledge Intelligence Platform",
  description:
    "AI-powered RAG copilot for industrial operations. Ingest P&IDs, safety SOPs, and maintenance logs to build a queryable knowledge base that prevents unplanned downtime. Built by Team Debuggers.",
  keywords: [
    "industrial AI",
    "RAG copilot",
    "maintenance intelligence",
    "safety procedures",
    "pgvector",
    "knowledge base",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
