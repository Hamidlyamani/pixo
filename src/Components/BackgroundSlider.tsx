"use client";

import { useEffect, useState } from "react";

const images = [

  "/imgs/home1.png",
  "/imgs/3.webp",
  "/imgs/hom.png",
  "/imgs/6.png",
  "/imgs/home7.png",
];

export default function BackgroundSlider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {images.map((img, i) => (
        <div
          key={img}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${img})`,
            opacity: i === index ? 1 : 0,
          }}
        />
      ))}

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}
