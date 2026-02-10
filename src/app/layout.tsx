import "@/app/globals.css"
import localFont from "next/font/local";

import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],       // required
  weight: ["400", "500", "700"], // optional, pick what you need
  variable: "--font-dm-sans",    // optional if you use Tailwind
  display: "swap",               // improves performance
});


export const myFont = localFont({
  src: [
    // { path: "./../../public/font/SourGummy-Black.eot",  style: "normal" },
    { path: "./../../public/font/SourGummy-Black.ttf",  style: "normal" },
    { path: "./../../public/font/SourGummy-Black.woff",  style: "normal" },
    { path: "./../../public/font/SourGummy-Black.woff2", style: "normal" },
  ],
  variable: "--SourGummy",
   // optional, for Tailwind usage
});

export const metadata = {
  title: "Pexo - let's drow ...",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}