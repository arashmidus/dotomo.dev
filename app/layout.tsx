import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dotomo",
  description: "Your task management companion",
  icons: {
    icon: "/Group3518721.png",
    apple: "/Group3518721.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-[system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Display',${inter.style.fontFamily},sans-serif] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
