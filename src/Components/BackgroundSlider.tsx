"use client";

import { useEffect, useState } from "react";

const images = [
  "/imgs/1.webp",
  "/imgs/2.webp",
  "/imgs/3.webp",
  "/imgs/4.webp",
  "/imgs/5.webp",
  "/imgs/6.webp",
];
const imagesMob = [
  "/imgs/1mob.webp",
  "/imgs/2.webp",
  "/imgs/3mob.webp",
  "/imgs/4mob.webp",
  "/imgs/5mob.webp",
  "/imgs/6mob.webp",
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
      {/* Desktop */}
      {images.map((img, i) => (
        <div
          key={`desktop-${img}`}
          className="absolute inset-0 bg-cover bg-no-repeat bg-center transition-opacity duration-1000 hidden md:block"
          style={{
            backgroundImage: `url(${img})`,
            opacity: i === index ? 1 : 0,
          }}
        />
      ))}

      {/* Mobile */}
      {imagesMob.map((img, i) => (
        <div
          key={`mobile-${img}`}
          className="absolute inset-0 bg-cover bg-no-repeat bg-center transition-opacity duration-1000 block md:hidden"
          style={{
            backgroundImage: `url(${img})`,
            opacity: i === index ? 1 : 0,
          }}
        />
      ))}


      <div className="relative z-10 flex h-full min-h-screen  w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}
