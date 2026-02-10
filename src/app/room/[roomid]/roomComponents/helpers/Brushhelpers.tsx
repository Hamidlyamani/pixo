
import Konva from "konva";
import { ToolOptions } from "../../../../../../types";

export const createBrushStroke = (
  pos: { x: number; y: number },
  options: ToolOptions,
  layer: Konva.Layer,
  startPos?: { x: number; y: number }
) => {
  const strokeWidth = (options.strokeWidth || 5) * (options.pressure || 1);
  const opacity = options.opacity ?? 1;
  const smoothing = options.smoothing ?? 0;
  const spacing = options.spacing ?? 0;


  switch (options.brushCategory) {
    case "general": {
      // Round / Hard brushes
      const line = new Konva.Line({
        points: [pos.x, pos.y],
        stroke: options.color,
        strokeWidth,
        lineCap: options.brushSubType === "hard" ? "butt" : "round",
        lineJoin: "round",
        draggable: false,
        opacity,
        tension: smoothing,
        dash: spacing ? [spacing, spacing] : [],
      });

      layer.add(line);
      return line;
    }

    case "dry": {
      // Pencil / Charcoal → slightly jagged lines
      const line = new Konva.Line({
        points: [pos.x, pos.y],
        stroke: options.color || "gray",
        strokeWidth: 1,
        lineCap: "round",
        lineJoin: "round",
        dash: options.brushSubType === "pencil" ? [1, 2] : [],
        draggable: false,
        opacity,
        tension: smoothing,
      });

      layer.add(line);
      return line;
    }

    case "wet": {
      // Watercolor / Oil / Mixer → wider, semi-transparent
      const line = new Konva.Line({
        points: [pos.x, pos.y],
        stroke: options.color || "blue",
        strokeWidth:8,
        lineCap: "round",
        lineJoin: "round",
        draggable: false,
        opacity:0.6,
        tension: smoothing,
        dash: spacing ? [spacing, spacing] : [],
      });

    

      layer.add(line);
      return line;
    }

    case "special": {
      // Splatter / Texture / Cloud → random small dots/lines
      const group: Konva.Line[] = [];
      for (let i = 0; i < 5; i++) {
        const offsetX = Math.random() * 10 - 5;
        const offsetY = Math.random() * 10 - 5;
        const dot = new Konva.Line({
          points: [pos.x, pos.y, pos.x + offsetX, pos.y + offsetY],
          stroke: options.color || "gray",
          strokeWidth: Math.random() * 3 + 1,
          lineCap: "round",
          lineJoin: "round",
          opacity,
          tension: smoothing,
        });

        layer.add(dot);
        group.push(dot);
      }
      return group;
    }

    default:
      return null;
  }
};
