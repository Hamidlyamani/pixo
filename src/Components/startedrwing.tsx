"use client";
import React, { useState } from "react";
import { LayoutTextFlip } from "@/Components/TextFlip";
import Link from "next/link";
import { MdElectricBolt } from "react-icons/md";

type LiquidGlassProProps = {
  className?: string;
  rounded?: "2xl" | "3xl" | "4xl";
  strength?: "medium" | "strong" | "insane";
};

const roundedMap = {
  "2xl": "rounded-md ",
  "3xl": "rounded-3xl",
  "4xl": "rounded-[2.5rem]",
} as const;

const strengthMap = {
  medium: {
    blur: "backdrop-blur-xl",
    base: "bg-white/10",
    rim: "border-white/25",
    glow: "shadow-[0_25px_120px_rgba(0,0,0,0.35)]",
    inner: "shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-20px_35px_rgba(0,0,0,0.25)]",
    grainOpacity: "opacity-[0.08]",
  },
  strong: {
    blur: "backdrop-blur-2xl",
    base: "bg-white/12",
    rim: "border-white/30",
    glow: "shadow-[0_35px_160px_rgba(0,0,0,0.45)]",
    inner: "shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-26px_44px_rgba(0,0,0,0.32)]",
    grainOpacity: "opacity-[0.11]",
  },
  insane: {
    blur: "backdrop-blur-3xl",
    base: "bg-white/14",
    rim: "border-white/35",
    glow: "shadow-[0_45px_220px_rgba(0,0,0,0.55)]",
    inner: "shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-34px_60px_rgba(0,0,0,0.38)]",
    grainOpacity: "opacity-[0.14]",
  },
} as const;

export function LiquidGlassPro({
  className = "",
  rounded = "2xl",
  strength = "medium",
}: LiquidGlassProProps) {
  const s = strengthMap[strength];

  const [loading, setLoading] = useState(false);
  return (
    <div className={`relative ${roundedMap[rounded]} ${className}`}>
      {/* Ambient bloom behind glass */}
      <div
        className={[
          "pointer-events-none absolute -inset-8",
          "blur-2xl opacity-60",
          "bg-[radial-gradient(60%_60%_at_35%_35%,rgba(255,255,255,0.20),transparent_60%),radial-gradient(60%_60%_at_70%_65%,rgba(80,160,255,0.22),transparent_62%)]",
        ].join(" ")}
      />

      {/* Main glass */}
      <div
        className={[
          "relative overflow-hidden border",
          roundedMap[rounded],
          s.blur,
          s.base,
          s.rim,
          s.glow,
        ].join(" ")}
      >
        {/* Liquid body: multi-layer gradient to fake refraction */}
        <div className="absolute inset-0 bg-[radial-gradient(140%_160%_at_20%_10%,rgba(255,255,255,0.70),rgba(255,255,255,0.18)_35%,rgba(255,255,255,0.08)_60%,rgba(255,255,255,0.03)),radial-gradient(120%_140%_at_80%_70%,rgba(120,190,255,0.18),rgba(255,255,255,0.05)_55%,transparent_70%)]" />

        {/* Outer specular edge (top) */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className={[
              "absolute left-0 top-0 h-[2px] w-full",
              "bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]",
              "opacity-70",
            ].join(" ")}
          />
          <div
            className={[
              "absolute left-0 top-0 h-24 w-full",
              "bg-[radial-gradient(100%_140%_at_50%_0%,rgba(255,255,255,0.35),transparent_70%)]",
              "opacity-80",
            ].join(" ")}
          />
        </div>

        {/* Secondary highlight (bottom-right) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-[-35%] right-[-25%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_60%)] blur-2xl opacity-60" />
        </div>

        {/* Animated sweep highlight (the “liquid” feel) */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className={[
              "absolute -top-28 left-[-35%] h-72 w-[170%] rotate-8",
              "bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),rgba(255,255,255,0.38),rgba(255,255,255,0.22),transparent)]",
              "blur-xl opacity-70",
              "animate-[glassSweepPro_5.8s_ease-in-out_infinite]",
            ].join(" ")}
          />
          <div
            className={[
              "absolute -top-44 left-[-40%] h-72 w-[180%] rotate-8",
              "bg-[linear-gradient(90deg,transparent,rgba(120,190,255,0.12),rgba(255,255,255,0.14),rgba(120,190,255,0.12),transparent)]",
              "blur-2xl opacity-70",
              "animate-[glassSweepPro_5.8s_ease-in-out_infinite]",
            ].join(" ")}
          />
        </div>

        {/* Inner rim + inner shadow (depth) */}
        <div
          className={[
            "pointer-events-none absolute inset-[1px]",
            roundedMap[rounded],
            s.inner,
          ].join(" ")}
        />

        {/* Double inner border (gives premium edge) */}
        <div
          className={[
            "pointer-events-none absolute inset-[10px] ",
            roundedMap[rounded],
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]",
          ].join(" ")}
        />

        {/* Grain (stronger + visible) */}
        <div
          className={[
            "pointer-events-none absolute inset-0 mix-blend-overlay",
            s.grainOpacity,
            "bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22400%22 height=%22400%22 filter=%22url(%23n)%22 opacity=%220.55%22/%3E%3C/svg%3E')]",
          ].join(" ")}
        />

        {/* Content */}
        <div className="relative z-10 p-4 md:p-7">
          <div className="flex justify-center flex-col items-center">
            <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-center text-gray-900 mb-4 leading-tight">
              <LayoutTextFlip
                text="Let’s "
                words={["Sketch", "Study", "Brainstorm", "Imagine", "Create", "Collaborate"]}
              />


              {" "}
              Together...
            </h1>
            <p className="my-2 text-black/80 text-base md:text-lg max-w-2xl  text-center">
              Pixo is a real-time drawing app for creators, students, and friends.<br />
              Create, refine, and build ideas together on one shared canvas.
            </p>
            <Link
              href="/join"
              onClick={() => setLoading(true)}
              className="bg-primary p-6 py-2 font-bold text-black uppercase rounded-md text-center mt-2 m-auto inline-flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Loading..." : "Start Drawing"}
            </Link>
            <span className="text-sm mt-2 text-black/80 flex gap-1 items-center"><MdElectricBolt className="text-green-600" /> Free. Instant. No account needed.</span>
          </div>
        </div>
      </div>

      {/* keyframes */}
      <style jsx>{`
        @keyframes glassSweepPro {
          0% {
            transform: translateX(-22%) rotate(8deg);
            opacity: 0.35;
          }
          40% {
            opacity: 0.75;
          }
          50% {
            transform: translateX(22%) rotate(8deg);
            opacity: 0.9;
          }
          60% {
            opacity: 0.7;
          }
          100% {
            transform: translateX(-22%) rotate(8deg);
            opacity: 0.35;
          }
        }
      `}</style>
    </div>
  );
}
