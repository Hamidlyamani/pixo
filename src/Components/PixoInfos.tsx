"use client";

import Image from "next/image";
import logo from "/public/imgs/pixo.png"
import { useState } from "react";
import { X } from "lucide-react";
import { inter, montserrat, sourGummy } from "@/app/fonts";

export default function PixoInfos() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(!open)} className="flex gap-1 absolute right-4 bottom-2  w-fit items-end justify-center p-4 cursor-pointer " title="About us" >
        <div><Image src={logo} alt="pixo " className="w-[50px] " /></div>
        <div><h2 className={`text-primary text-h2-2 font-black ${sourGummy.className} `} >Pixo</h2></div>
      </div>
      {open && (
        <div className="fixed bottom-24 md:right-6 w-11/12 md:w-80 p-5 rounded-lg bg-white border border-gray-200 shadow-lg animate-slide-up">
          <h3 className={`text-lg font-semibold mb-2 ${montserrat.className} `}>About Pixo</h3>
          <button onClick={() => setOpen(false)} className="absolute top-5 right-5">
            <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
          </button>
          <p className={`text-gray-600  ${inter.className}`}>
            <ul className="list-disc pl-1">
              <li>Pixo is a real-time collaborative drawing application designed for creators, students, and friends who want to share ideas visually.</li>
            <li>This is the first public version, and we’re continuously improving it.</li>
            <li>For feedback or collaboration, feel free to reach out via my <a href="http://elyamani.me/" target="_blank" className="underline text-primary text-bold ">website</a>.</li>
            </ul>
          </p>
        </div>)}
    </>
  )
}
