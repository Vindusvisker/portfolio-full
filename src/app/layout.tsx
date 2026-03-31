import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Marcus Ruud - Developer",
  description:
    "I'm Marcus Ruud, a developer building scalable SaaS, AI-integrated tools, and efficient digital products.",
  openGraph: {
    title: "Marcus Ruud - Developer",
    description:
      "Developer building scalable SaaS, AI-integrated tools, and efficient digital products.",
    url: "https://mruud.com",
    siteName: "Marcus Ruud",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marcus Ruud - Developer",
    description:
      "Developer building scalable SaaS, AI-integrated tools, and efficient digital products.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className="min-h-dvh font-sans antialiased">
        <ThemeProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <div className="flex min-h-dvh">
            {/* Left accent strip */}
            <div className="w-3 shrink-0 bg-accent" />
            <div className="flex min-w-0 flex-1 flex-col">
              <Navbar />
              <main id="main-content" className="flex-1">{children}</main>
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
