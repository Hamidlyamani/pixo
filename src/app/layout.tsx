import "@/app/globals.css";
import type { Metadata, Viewport } from "next";

import { inter, montserrat, dmSans, sourGummy } from "./fonts";
import Script from "next/script";


export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};
// ✅ Metadata complet
export const metadata: Metadata = {
  metadataBase: new URL("https://your-domain.com"), // change ça
  title: {
    default: "Pixo - Draw together in real time",
    template: "%s — Pixo",
  },
  description:
    "Pixo is a real-time multi-user drawing app for creators, students, and friends. Draw together online instantly.",
  applicationName: "Pixo",
  authors: [{ name: "Hamido", url: "https://your-portfolio.com" }], // change ça
  creator: "Hamido",
  keywords: ["collaborative drawing", "whiteboard", "real-time", "canvas", "pixo"],
  robots: { index: true, follow: true },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },

  // ✅ PWA / manifest (si tu l’as)
  manifest: "/site.webmanifest",

  // ✅ Open Graph (partage)
  openGraph: {
    type: "website",
    url: "https://your-domain.com",
    title: "Pixo: Draw together in real time",
    description:
      "A real-time shared canvas for creators, students, and friends. Start a room and draw together instantly.",
    siteName: "Pixo",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Pixo collaborative drawing app",
      },
    ],
  },

  // ✅ Twitter
  twitter: {
    card: "summary_large_image",
    title: "Pixo: Draw together in real time",
    description:
      "Real-time multi-user drawing. Start a room and collaborate instantly.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">

      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-KFM42VMMVJ"></Script>
        <Script>
           {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-KFM42VMMVJ');
           `}
        </Script>
        <meta name="google-site-verification" content="google-site-verification=vIx7jmlMKp-c9Vp3exTm1dLk1Zy8kssYXH31wKwgnpw" />

      </head>
      <body
        className={[
          inter.variable,
          montserrat.variable,
          dmSans.variable,
          sourGummy.variable,
          "min-h-dvh antialiased",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}
