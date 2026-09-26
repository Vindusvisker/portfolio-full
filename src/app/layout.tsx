import type { Metadata } from "next";
import { Geist, Roboto_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://mruud.com"),
  title: "Marcus Ruud",
  description:
    "Yo, I'm Marcus. I build products with code. Platforms, AI tools, automation.",
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
      className={cn(geist.variable, robotoMono.variable)}
    >
      <body className="min-h-dvh font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
