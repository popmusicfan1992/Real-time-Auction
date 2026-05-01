import type { Metadata } from "next";
import { Manrope, Work_Sans } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GALLERY X | Premium Real-Time Auction Platform",
  description:
    "Gain exclusive access to the world's most coveted assets. Real-time bidding, verified provenance, and uncompromising security.",
  keywords: [
    "auction",
    "real-time bidding",
    "luxury",
    "collectibles",
    "watches",
    "art",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Material Symbols */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${manrope.variable} ${workSans.variable} bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
