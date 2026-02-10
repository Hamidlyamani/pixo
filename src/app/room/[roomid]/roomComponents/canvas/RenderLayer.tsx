"use client";

import { Layer, Line } from "react-konva";
import { Stroke } from "../../../../../../types";

interface RenderLayerProps {
  strokes: Stroke[];
}

export default function RenderLayer({ strokes }: RenderLayerProps) {
 

  return (
    <Layer>
      {strokes.map((stroke) => {
        if (stroke.tool !== "line") return null;

        return (
          <Line
            key={stroke.id}
            points={stroke.points}
            stroke={stroke.style?.color ?? "#000"}
            strokeWidth={stroke.style?.strokeWidth ?? 2}
            opacity={stroke.style?.opacity ?? 1}
            lineCap="round"
            lineJoin="round"
            listening={false} // IMPORTANT for performance
          />
        );
      })}
    </Layer>
  );
}
