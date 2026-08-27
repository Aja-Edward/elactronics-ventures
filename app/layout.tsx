import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";

import { getSiteSettings } from "@/lib/site";

import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

/**
 * Title template means every page supplies only its own name and inherits the
 * company suffix, instead of each page repeating it (or worse, all pages
 * sharing one title, as the reference site does).
 */
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();

  return {
    title: {
      default: site.defaultSeoTitle,
      template: `%s | ${site.companyName}`,
    },
    description: site.defaultSeoDescription,
    // Set NEXT_PUBLIC_SITE_URL once the domain is purchased; until then
    // canonical and OG URLs resolve against localhost.
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    openGraph: {
      siteName: site.companyName,
      type: "website",
      locale: "en_NG",
    },
  };
}

/**
 * Deliberately minimal: html/body, fonts and site-wide metadata only. Public
 * chrome lives in app/(site)/layout.tsx; the admin brings its own.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-body">{children}</body>
    </html>
  );
}
