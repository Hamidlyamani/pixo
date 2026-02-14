// brushHelper.ts
import type { ToolOptions } from "../../../../../../types";

export function getBrushLineProps(options?: ToolOptions) {
  const strokeWidth = options?.strokeWidth ?? 5;
  const opacity = options?.opacity ?? 1;
  const smoothing = options?.smoothing ?? 0;
  const spacing = options?.spacing ?? 0;

  const base = {
    stroke: options?.color ?? "#000",
    strokeWidth,
    opacity,
    tension: smoothing,
    dash: spacing ? [spacing, spacing] : undefined,
    lineJoin: "round" as const,
  };

  switch (options?.brushCategory) {
    case "general":
      return {
        ...base,
        lineCap: options.brushSubType === "hard" ? ("butt" as const) : ("round" as const),
      };

    case "dry":
      return {
        ...base,
        stroke: options.color ?? "gray",
        strokeWidth: options.brushSubType === "pencil" ? 1 : Math.max(1, strokeWidth * 0.4),
        lineCap: "round" as const,
        dash: options.brushSubType === "pencil" ? [1, 2] : base.dash,
      };

    case "wet":
      return {
        ...base,
        stroke: options.color ?? "blue",
        strokeWidth: Math.max(6, strokeWidth),
        opacity: Math.min(1, opacity * 0.6),
        lineCap: "round" as const,
      };

    case "special":
      // Sans refonte de types, on ne peut pas faire 5 “dots” séparés.
      // On peut juste changer le rendu du trait (ex: dash + width).
      return {
        ...base,
        lineCap: "round" as const,
        dash: [1, 6],
      };

    default:
      return {
        ...base,
        lineCap: "round" as const,
      };
  }
}
