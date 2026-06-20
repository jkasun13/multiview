import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BreakingNewsBanner from "@/components/story/BreakingNewsBanner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Multiview — Compare How News Outlets Cover the Same Story",
    template: "%s | Multiview",
  },
  description:
    "Multiview shows you how different news outlets cover the same story side by side, with AI-generated analysis of agreement, disagreement, and missing context.",
  keywords: ["news comparison", "media bias", "news analysis", "journalism"],
  openGraph: {
    type: "website",
    siteName: "Multiview",
    title: "Multiview — Compare News Coverage Side by Side",
    description:
      "See how CNN, BBC, Reuters, Fox News, and more cover the same story. AI highlights what they agree on, where they differ, and what's missing.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Multiview — Compare News Coverage Side by Side",
    description:
      "AI-powered news comparison: see where outlets agree, disagree, and what context is missing.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900 antialiased">
        <Header />
        <BreakingNewsBanner />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
