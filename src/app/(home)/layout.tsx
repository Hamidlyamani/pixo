import BackgroundSlider from "@/Components/BackgroundSlider";
import PixoInfos from "@/Components/PixoInfos";



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex h-screen  items-center justify-center  `}>
      <BackgroundSlider>{children}
        <PixoInfos />
      </BackgroundSlider>
    </div>
  );
}