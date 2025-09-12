'use client'

// import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Suspense } from "react";
import Providers from "@/components/shared/providers";
// export const metadata: Metadata = {
//   title: "Blockchain Voting System",
//   description:
//     "A secure, transparent, and decentralized voting platform powered by Ethereum",
//   generator: "web3",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
