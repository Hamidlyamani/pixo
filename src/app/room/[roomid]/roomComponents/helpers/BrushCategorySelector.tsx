"use client";
import React from "react";
import { BRUSH_TYPES, BrushCategory, ToolOptions } from "../../../../../../types";
import { FaPaintBrush, FaPencilAlt, FaWater, FaMagic } from "react-icons/fa";

type Props = {
  options: ToolOptions;
  setOptions: (opts: ToolOptions) => void;
};

export default function BrushCategorySelector({ options, setOptions }: Props) {
  const categories: { type: BrushCategory; icon: React.ReactNode; label: string }[] = [
    { type: BRUSH_TYPES.GENERAL, icon: <FaPaintBrush />, label: "General" },
    { type: BRUSH_TYPES.DRY, icon: <FaPencilAlt />, label: "Dry" },
    { type: BRUSH_TYPES.WET, icon: <FaWater />, label: "Wet" },
    { type: BRUSH_TYPES.SPECIAL, icon: <FaMagic />, label: "Special" },
  ];

  const selectCategory = (category: BrushCategory) => {
    setOptions({ ...options, brushCategory: category });
  };

  return (
    <div className="flex gap-2">
      {categories.map((cat) => (
        <button
          key={cat.type}
          onClick={() => selectCategory(cat.type)}
          title={cat.label}
          className={`p-1 text-xs  rounded border ${
            options.brushCategory === cat.type ? "bg-blue-500 text-white" : "bg-white"
          } flex items-center justify-center`}
        >
          {cat.icon}
        </button>
      ))}
    </div>
  );
}
