"use client";

import { useCallback, useRef, useState } from "react";
import { Shape } from "../../../../../../types";

export function useShapes(authorId: string) {
  const [shapes, setShapes] = useState<Shape[]>([]);

  // Active shape drawn by THIS user
  const activeShapeIdRef = useRef<string | null>(null);

  /* ---------------------------------------------
     Add shape (shape:start)
  --------------------------------------------- */
  const addShape = useCallback((shape: Shape) => {
    setShapes((prev) => [...prev, shape]);
    activeShapeIdRef.current = shape.id;
  }, []);

  /* ---------------------------------------------
     Update shape (shape:update)
     FULL payload replace (no updater fn)
  --------------------------------------------- */
const updateShape = useCallback(
  <T extends Shape["tool"]>(
    id: string,
    payload: Extract<Shape, { tool: T }>["payload"],
    status: Shape["status"] = "drawing"
  ) => {
    setShapes((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              payload: payload as any, // safe by design
              status,
            }
          : s
      )
    );
  },
  []
);


const updateTransform = useCallback(
  (
    id: string,
    transform: NonNullable<Shape["transform"]>,
    status?: Shape["status"]
  ) => {
    setShapes(prev =>
      prev.map(s =>
        s.id === id
          ? {
              ...s,
              transform: { ...(s.transform ?? {}), ...transform },
              status: status ?? s.status,
            }
          : s
      )
    );
  },
  []
);



  /* ---------------------------------------------
     End shape (shape:end)
  --------------------------------------------- */
  const endShape = useCallback((id: string) => {
    setShapes((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "done",
            }
          : s
      )
    );

    if (activeShapeIdRef.current === id) {
      activeShapeIdRef.current = null;
    }
  }, []);

  /* ---------------------------------------------
     Replace all shapes (room hydration)
  --------------------------------------------- */
  const setAllShapes = useCallback((next: Shape[]) => {
    setShapes(next);
    activeShapeIdRef.current = null;
  }, []);

  return {
    shapes,

    // actions
    addShape,
    updateShape,
    updateTransform, 
    endShape,

    // sync / hydration
    setAllShapes,

    // internal
    activeShapeIdRef,
  };
}
