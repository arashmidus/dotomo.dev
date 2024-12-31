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
      path: '../public/fonts/sf-pro-display-regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/sf-pro-display-medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/sf-pro-display-semibold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/sf-pro-display-bold.ttf',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-sf-pro'
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

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
      <body className={`${sfPro.variable} font-sf-pro min-h-[100dvh] pb-[env(safe-area-inset-bottom)]`}>
        {children}
      </body>
    </html>
  );
}
