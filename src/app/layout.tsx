import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-8rem)]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
