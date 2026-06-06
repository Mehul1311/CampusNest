import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { LandingThemeProvider } from "@/contexts/LandingThemeContext";
import { ToasterProvider } from "@/components/ToasterProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusNest | Buy & Sell on Campus",
  description: "Buy and sell items within your college campus. Books, electronics, furniture, and more.",
  keywords: ["campus", "college", "marketplace", "buy", "sell", "students"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <LandingThemeProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </LandingThemeProvider>
        </AuthProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}
