import BackgroundSlider from "@/app/Components/BackgroundSlider";
import PixoInfos from "@/app/Components/PixoInfos";



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex h-dvh  items-center justify-center  `}>
      <BackgroundSlider>{children}
        <PixoInfos />
      </BackgroundSlider>
    </div>
  );
}