
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export const LayoutTextFlip = ({
  text = "Build Amazing",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 5000,
}: {
  text: string;
  words: string[];
  duration?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

 useEffect(() => {
  if (!words.length) return;

  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % words.length);
  }, duration);

  return () => clearInterval(interval);
}, [duration, words.length]);

  return (
    <>
      <motion.span
        layoutId="subtext"
        className=" font-bold tracking-tight drop-shadow-lg "
      >
        {text}
      </motion.span>

      <motion.span
        layout
        className="relative w-fit overflow-hidden rounded-md   px-0 py-2 font-bold tracking-tight"
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={currentIndex}
            initial={{ y: -40, filter: "blur(10px)" }}
            animate={{
              y: 0,
              filter: "blur(0px)",
            }}
            exit={{ y: 50, filter: "blur(10px)", opacity: 0 }}
            transition={{
              duration: 0.5,
            }}
            className={"inline-block whitespace-nowrap text-center px-1  relative   after:content-['']  after:absolute  after:left-[5%]  after:-bottom-2  after:w-full  after:h-3  after:bg-[url('/imgs/elem.png')]  after:bg-contain  after:bg-no-repeat"}
          >
            {words[currentIndex]}
            

          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  );
};


