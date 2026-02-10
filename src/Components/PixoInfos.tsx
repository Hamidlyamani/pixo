"use client";

import Image from "next/image";
import logo from "/public/imgs/pixo.png"
import { myFont } from "@/app/layout";
import { useState } from "react";
import { X } from "lucide-react";

export default function PixoInfos() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(!open)} className="flex gap-1 absolute right-4 bottom-4  w-fit items-end justify-center p-4 cursor-pointer " title="Who am I?" >
        <div><Image src={logo} alt="pixo kjjjjjjjjjjjjj" className="w-[50px] " /></div>
        <div><h2 className={`text-white text-h2-2 font-black`} >Pixo</h2></div>
      </div>
      {open && (
        <div className="fixed bottom-10 right-6 w-80 p-5 rounded-2xl bg-white border border-gray-200 shadow-lg animate-slide-up">
          <h3 className="text-lg font-semibold mb-2">Support Chat 💬</h3>
          <button onClick={() => setOpen(false)} className="absolute top-5 right-5">
            <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
          </button>
          <p className="text-gray-600">
            Hey there! How can we help you today?
          </p>
        </div>)}
    </>
  )
}
