import type { Metadata } from "next";
import { Geist, Geist_Mono, Amiri, Scheherazade_New, Noto_Naskh_Arabic, Amiri_Quran, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Premium corporate geometric typeface for the Qtuor brand wordmark & logo lockup.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

const scheherazade = Scheherazade_New({
  variable: "--font-scheherazade",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const amiriQuran = Amiri_Quran({
  variable: "--font-amiri-quran",
  subsets: ["arabic"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Qtuor — Online Noorani Qaida & Quran Classes with Certified Tutors",
  description:
    "Learn Noorani Qaida, Quran Recitation with Tajweed, and Hifz online with certified Qaris. 1-on-1 live virtual classroom. Book a free 30-minute trial class today on Qtuor.",
  keywords: [
    "online Noorani Qaida classes for kids", "learn Arabic alphabet with Tajweed", "best online Qaida tutor",
    "1-on-1 online Quran classes", "certified female Quran teachers online", "online Quran academy",
    "Quran tutor", "online Quran classes", "Quran Recitation With Tajweed", "Tajweed rules",
    "Hifz online", "Noorani Qaida online", "Arabic learning", "Islamic education", "Qtuor",
    "Quran memorization online", "online Quran teacher", "Qaida for beginners",
  ],
  authors: [{ name: "Qtuor" }],
  icons: {
    icon: [
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-64.png", type: "image/png", sizes: "64x64" },
    ],
    shortcut: "/favicon-32.png",
    apple: [{ url: "/favicon-180.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Qtuor — Online Noorani Qaida & Quran Classes with Certified Tutors",
    description:
      "1-on-1 live Quran classes with certified Qaris. Master Noorani Qaida, Quran Recitation, Tajweed, and Hifz in our interactive virtual classroom. Free trial available.",
    siteName: "Qtuor",
    type: "website",
    url: "https://www.qtuor.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} ${amiri.variable} ${scheherazade.variable} ${notoNaskh.variable} ${amiriQuran.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
