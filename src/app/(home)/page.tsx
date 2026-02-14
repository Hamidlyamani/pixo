import PixoInfos from "@/Components/PixoInfos";
import  { LiquidGlassPro } from "@/Components/startedrwing";

export const dynamic = 'force-dynamic';


export default function Home() {
  return <>
    <LiquidGlassPro className="mx-auto max-w-4xl">
  <h1 className="text-4xl md:text-2xl font-semibold text-black tracking-tight">
    One Canvas. Infinite Minds.
  </h1>
  <p className="mt-4 text-black/80 text-base md:text-lg max-w-2xl">
    Create, sketch and collaborate in real-time. No friction. No installs.
  </p>
</LiquidGlassPro>


     <PixoInfos/>
  </>;
}