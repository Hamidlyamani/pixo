import { nanoid } from "nanoid";
import { Shape, ToolOptions } from "../../../../../../types";

/* ---------------------------------------------
   Types
--------------------------------------------- */

export type ToolEvent = {
  pos: { x: number; y: number };
  target?: any
};

export type ToolHandlers = {
  onDown?: (e: ToolEvent) => void;
  onMove?: (e: ToolEvent) => void;
  onUp?: () => void;
};

type ShapesApi = {
  addShape: (shape: Shape) => void;
  updateShape: (
    id: string,
    payload: Shape["payload"],
    status?: Shape["status"]
  ) => void;
  endShape: (id: string) => void;
};

/* ---------------------------------------------
   Factory
--------------------------------------------- */

export function createToolHandlers(
  shapesApi: ShapesApi,
  options: ToolOptions,
  authorId: string,
  activeShapeIdRef: React.MutableRefObject<string | null>,
  startPosRef: React.MutableRefObject<{ x: number; y: number }>,
  brushPointsRef: React.MutableRefObject<number[]>,
  trRef: any,
): Record<string, ToolHandlers> {
  const { addShape, updateShape, endShape } = shapesApi;

  const startShape = (shape: Shape) => {
    activeShapeIdRef.current = shape.id;
    addShape(shape);
  };

  const updateActive = (payload: Shape["payload"]) => {
    const id = activeShapeIdRef.current;
    if (!id) return;
    updateShape(id, payload, "drawing");
  };

  const endActive = () => {
    const id = activeShapeIdRef.current;
    if (!id) return;
    endShape(id);
    activeShapeIdRef.current = null;
    brushPointsRef.current.length = 0;
  };

  return {
    /* ===== BRUSH ===== */
    brush: {
      onDown: ({ pos }) => {
        brushPointsRef.current.length = 0;
        brushPointsRef.current.push(pos.x, pos.y);
        startShape({
          id: nanoid(),
          tool: "brush",
          authorId,
          status: "drawing",
          style: options,
          payload: { points: [...brushPointsRef.current] },
        });
      },

      onMove: ({ pos }) => {
        if (!activeShapeIdRef.current) return;
        brushPointsRef.current.push(pos.x, pos.y);
        updateActive({ points: [...brushPointsRef.current] });
      },

      onUp: endActive,
    },

    /* ===== ERASER ===== */
    eraser: {
      onDown: ({ pos }) => {
        brushPointsRef.current.length = 0;
        brushPointsRef.current.push(pos.x, pos.y);

        startShape({
          id: nanoid(),
          tool: "eraser",
          authorId,
          status: "drawing",
          style: options,
          payload: { points: [...brushPointsRef.current] },
        });
      },

      onMove: ({ pos }) => {
        if (!activeShapeIdRef.current) return;
        brushPointsRef.current.push(pos.x, pos.y);
        updateActive({ points: [...brushPointsRef.current] });
      },

      onUp: endActive,
    },

    /* ===== LINE ===== */
    line: {
      onDown: ({ pos }) => {
        startPosRef.current = { x: pos.x, y: pos.y };
        startShape({
          id: nanoid(),
          tool: "line",
          authorId,
          status: "drawing",
          style: options,
          payload: {
            x1: pos.x,
            y1: pos.y,
            x2: pos.x,
            y2: pos.y,
          },
        });
      },

      onMove: ({ pos }) => {
        const s = startPosRef.current;
        updateActive({
          x1: s.x,
          y1: s.y,
          x2: pos.x,
          y2: pos.y,
        });
      },

      onUp: endActive,
    },

    /* ===== RECT ===== */
    rect: {
      onDown: ({ pos }) => {
        startPosRef.current = { x: pos.x, y: pos.y };

        startShape({
          id: nanoid(),
          tool: "rect",
          authorId,
          status: "drawing",
          style: options,
          payload: {
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
          },
        });
      },

      onMove: ({ pos }) => {
        const s = startPosRef.current;
        updateActive({
          x: s.x,
          y: s.y,
          width: pos.x - s.x,
          height: pos.y - s.y,
        });
      },

      onUp: endActive,
    },

    /* ===== ELLIPSE ===== */
    ellipse: {
      onDown: ({ pos }) => {
        startPosRef.current = { x: pos.x, y: pos.y };

        startShape({
          id: nanoid(),
          tool: "ellipse",
          authorId,
          status: "drawing",
          style: options,
          payload: {
            x: pos.x,
            y: pos.y,
            radiusX: 0,
            radiusY: 0,
          },
        });
      },

      onMove: ({ pos }) => {
        const s = startPosRef.current;
        updateActive({
          x: s.x,
          y: s.y,
          radiusX: Math.abs(pos.x - s.x),
          radiusY: Math.abs(pos.y - s.y),
        });
      },

      onUp: endActive,
    },

    /* ===== TEXT ===== */
    text: {
      onDown: ({ pos, target }) => {
        // If user clicked an existing Konva Text node, don't create a new one.
        if (target && typeof target.getClassName === "function") {

          if (target.getClassName() === "Text") return;
        }
        addShape({
          id: nanoid(),
          tool: "text",
          authorId,
          status: "done",
          style: options,
          payload: {
            x: pos.x,
            y: pos.y,
            text: "Double-click to edit",
          },
        });
      },
    },


    /* ===== SELECT (LOCAL ONLY) ===== */
   select: {
  onDown: ({ target }) => {
    if (!target) return;

    // ignore transformer & its children
    const name = target.name?.() || "";
    if (target === trRef.current) return;
    if (name.includes("transformer") || name.includes("anchor")) return;

    // si clic sur le stage (vide) => déselection
    if (target.getClassName?.() === "Stage") {
      trRef.current.nodes([]);
      return;
    }

    trRef.current.nodes([target]);
  },
},


    // node.on("dragmove", () => {
    //   updateShape(shape.id, {
    //     x: node.x(),
    //     y: node.y(),
    //   });
    //   emitShapeUpdate(...);
    // });

    // node.on("transformend", () => {
    //   updateShape(shape.id, {
    //     x: node.x(),
    //     y: node.y(),
    //     rotation: node.rotation(),
    //     scaleX: node.scaleX(),
    //     scaleY: node.scaleY(),
    //   });
    //   emitShapeUpdate(...);
    // });



  

  };
}
