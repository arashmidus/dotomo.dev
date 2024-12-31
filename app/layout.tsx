import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

const sfPro = localFont({
  src: [
    {
      path: '../public/fonts/SF-Pro-Display-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/SF-Pro-Display-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/SF-Pro-Display-Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/SF-Pro-Display-Bold.woff2',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-sf-pro'
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
      <body className={`${sfPro.variable} font-sf-pro min-h-[100dvh] pb-[env(safe-area-inset-bottom)]`}>
        {children}
      </body>
    </html>
  );
}
