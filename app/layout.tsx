import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSearchIndex } from "@/lib/search/get-index";
import { SITE_NAME, SITE_URL } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: Find. Compare. Choose Better.`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Find the software that moves your business forward. Browse categories, compare products side by side and shortlist the right tools for your team.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Built once from static data; no request-time APIs, so the shell prerenders.
  const searchIndex = await getSearchIndex();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface font-sans text-ink">
        <Header searchIndex={searchIndex} />
        <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
