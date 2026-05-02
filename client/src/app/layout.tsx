import type { Metadata } from "next";
import { Manrope, Work_Sans } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
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
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${manrope.variable} ${workSans.variable} bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased`}
      >
        {/* Load Material Symbols asynchronously to avoid render-blocking */}
        <Script
          id="material-symbols-loader"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap';
              document.head.appendChild(link);
            `,
          }}
        />
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

