import { Inter, Montserrat } from "next/font/google";

export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });





export const metadata = {
  title: "Pexo - let's drow ...",
};

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  return (
    
      <div className={`${inter.variable} ${montserrat.variable}`}>{children}</div>
   
  );
}