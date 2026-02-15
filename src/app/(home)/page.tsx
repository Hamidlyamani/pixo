import { LiquidGlassPro } from "@/Components/startedrwing";
import { LayoutTextFlip } from "@/Components/TextFlip";
import Link from "next/link";
import { MdElectricBolt } from "react-icons/md";
import { montserrat } from "../fonts";



export default function Home() {
  return <>
    <LiquidGlassPro className={`${montserrat.className} "mx-auto w-full px-4 md:w-2/3 lg:w-1/2 max-w-4xl`}>
      <div className="flex justify-center flex-col items-center">
        <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-center text-gray-900 mb-4 leading-tight">
          <LayoutTextFlip
            text="Let’s "
            words={["Sketch", "Imagine", "Brainstorm", "Create", "Collaborate"]}
          />


          {" "}
          Together...
        </h1>
        <p className="my-2 text-black/80 text-base md:text-lg max-w-2xl  text-center">
          Pixo is a real-time drawing app for creators, students, and friends.<br />
          Create, refine, and build ideas together on one shared canvas.
        </p>
        <Link href="/join" className="bg-primary px-6 py-2 font-bold text-black uppercase rounded-md text-center mt-2 m-auto">Start Drawing</Link>
     <span className="text-sm mt-2 text-black/80 flex gap-1 items-center"><MdElectricBolt className="text-green-600" /> Free. Instant. No account needed.</span>
      </div>
    </LiquidGlassPro>


    
  </>;
}