import type { Metadata } from "next";
import { Barlow_Condensed, Geist, Roboto_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { RouteTransitionProvider } from "@/components/route-transition";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" });
// Headlines: a condensed industrial grotesk, the lettering on a drawing sheet.
const barlow = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL("https://mruud.com"),
  title: "Marcus Ruud",
  description:
    "Hey, I'm Marcus! I build products with code. Platforms, AI tools, automation.",
  openGraph: {
    title: "Marcus Ruud",
    description:
      "I build products with code. Platforms, AI tools, automation.",
    url: "https://mruud.com",
    siteName: "Marcus Ruud",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marcus Ruud",
    description:
      "I build products with code. Platforms, AI tools, automation.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(geist.variable, robotoMono.variable, barlow.variable)}
    >
      <body className="min-h-dvh font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <RouteTransitionProvider>
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
        </RouteTransitionProvider>
      </body>
    </html>
  );
}
