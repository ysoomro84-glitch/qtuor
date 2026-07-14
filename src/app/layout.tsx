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
  title: "Qtuor — Connect with Certified Quran Tutors Globally",
  description:
    "Qtuor is a global online Quran learning platform. Learn Noorani Qaida, Quran Recitation With Tajweed, Hifz, and Arabic with certified tutors in a real-time interactive virtual classroom.",
  keywords: [
    "Quran", "Quran tutor", "online Quran classes", "Quran Recitation With Tajweed", "Tajweed", "Hifz",
    "Noorani Qaida", "Arabic learning", "Islamic education", "Qtuor",
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
    title: "Qtuor — Global Online Quran Learning Platform",
    description:
      "Connect with certified Quran tutors globally. Interactive virtual classroom, monthly plans, and verified teachers.",
    siteName: "Qtuor",
    type: "website",
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
