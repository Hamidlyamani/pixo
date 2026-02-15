import localFont from "next/font/local";
import { Inter, Montserrat, DM_Sans } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const sourGummy = localFont({
  src: [
    { path: "../../public/font/SourGummy-Black.woff2", style: "normal" },
    { path: "../../public/font/SourGummy-Black.woff", style: "normal" },
    { path: "../../public/font/SourGummy-Black.ttf", style: "normal" },
  ],
  variable: "--font-sour-gummy",
  display: "swap",
});
