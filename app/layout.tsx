import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import CentralPlexus from "@/components/CentralPlexus";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "InfraX AI - Your Infrastructure, Running Itself",
  description: "Autonomous infrastructure monitoring powered by AI. Monitor highways, cities, and buildings with 24/7 AI agents. From detection to resolution in under 2 seconds.",
  keywords: "infrastructure monitoring, AI, smart highways, smart cities, smart buildings, ATMS, IoT, autonomous systems",
  authors: [{ name: "InfraX AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://infrax.ai",
    siteName: "InfraX AI",
    title: "InfraX AI - Your Infrastructure, Running Itself",
    description: "Autonomous infrastructure monitoring powered by AI. From detection to resolution in under 2 seconds.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "InfraX AI - Autonomous Infrastructure Monitoring",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InfraX AI - Your Infrastructure, Running Itself",
    description: "Autonomous infrastructure monitoring powered by AI.",
    images: ["/og-image.png"],
    creator: "@infraxai",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-white">
        <CentralPlexus />
        <Navbar />
        <ScrollReveal />
        <main className="relative z-[1]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
