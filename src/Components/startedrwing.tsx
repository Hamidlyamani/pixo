"use client";


import Link from "next/link";


export default function Startedrwing() {
  return (
    <>
      <div className="w-8/12 m-auto text-center h-[200px]  relative  rounded-[2rem] p-5  liquidGlass-wrapper">
        <div className="liquidGlass-effect"></div>
        <div className="liquidGlass-tint"></div>
        <div className="liquidGlass-shine"></div>
        <div className="liquidGlass-text">
          <h1 className="text-black text-h3  liquidGlass-text text-center" >Pixo — Collaborative Drawing Reimagined
          </h1>
          <p className="w-3/4 my-4 mx-auto text-p text-black">
            Pixo is a real-time multiplayer canvas where creativity meets chaos. Sketch, doodle, and create together — live, with anyone, anywhere. No limits. Just pure, shared imagination.
          </p>
          <Link href="/join" className="bg-primary px-6 py-2 font-black text-black uppercase rounded-md text-center m-auto">Start Drawing</Link>
        </div>
      </div>
    </>

  )
}
