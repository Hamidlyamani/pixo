"use client";

import { useCallback, useState } from "react";
import { Stroke } from "../../../../../../types";

export function useStrokes(authorId: string) {

  const [strokes, setStrokes] = useState<Stroke[]>([]);

  // ---------- CREATE ----------
  const startStroke = useCallback((stroke: Stroke) => {
    setStrokes((prev) => [...prev, stroke]);
  }, []);

 const updateStroke = useCallback(
  (id: string, point: { x: number; y: number }) => {
    setStrokes((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              points: [...s.points, point.x, point.y],
            }
          : s
      )
    );
  },
  []
);


  // ---------- END ----------
  const endStroke = useCallback((id: string) => {
    setStrokes((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "done" } : s
      )
    );
  }, []);

  return {
    strokes,
    startStroke,
    updateStroke,
    endStroke,
    setStrokes, // 🔥 keep this for socket hydration / room-state
  };
}
