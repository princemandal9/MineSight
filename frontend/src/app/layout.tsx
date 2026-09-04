import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MineSight — Mining Safety Intelligence Platform",
  description:
    "The enterprise contractor & supervisor portal for open-pit mines. Zero-data leakage, deterministic compliance, role-based access control.",
};

/**
 * RootLayout component - Root layout wrapper for the entire Next.js application.
 * Configures global fonts, dark mode class, and establishes the base HTML structure.
 *
 * @param props - Layout props containing children to render
 * @returns React component wrapping application content with HTML and body tags
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-neutral-950 dark:bg-mine-950">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
