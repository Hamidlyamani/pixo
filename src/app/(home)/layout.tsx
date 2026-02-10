import BackgroundSlider from "@/Components/BackgroundSlider";



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
   <div className={`flex h-screen items-center justify-center  `}>
       <BackgroundSlider>{children}</BackgroundSlider>
  </div>
  );
}