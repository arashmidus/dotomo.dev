import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "Dotomo",
  description: "Your task management companion",
  icons: {
    icon: "/Group3518721.png",
    apple: "/Group3518721.png",
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-[system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Display'] min-h-[100dvh] pb-[env(safe-area-inset-bottom)]">
        {children}
      </body>
    </html>
  );
}
