import type { Metadata } from "next";
import { Arimo, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/lib/components/Header";

const arimo = Arimo({
  variable: "--font-editor",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GlobalSoft - Simplifying Software Solutions",
  description: "GlobalSoft is a simple",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${arimo.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
