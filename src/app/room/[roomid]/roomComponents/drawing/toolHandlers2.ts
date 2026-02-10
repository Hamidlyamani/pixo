import { nanoid } from "nanoid";
import { Stroke, ToolOptions } from "../../../../../../types";

type Point = { x: number; y: number };

type ToolEvent = {
  pos: Point;
};

export type ToolHandlers = {
  onDown?: (e: ToolEvent) => void;
  onMove?: (e: ToolEvent) => void;
  onUp?: () => void;
};

type StrokesAPI = {
  startStroke: (stroke: Stroke) => void;
  updateStroke: (id: string, point: Point) => void;
  endStroke: (id: string) => void;
};

export function createToolHandlers(
  strokesApi: StrokesAPI,
  options: ToolOptions,
  authorId: string,
  activeStrokeId: { current: string | null }
): Record<string, ToolHandlers> {
  return {
    line: {
      onDown: ({ pos }) => {
        const id = nanoid();
        activeStrokeId.current = id;

        const stroke: Stroke = {
          id,
          tool: "line",
          points: [pos.x, pos.y, pos.x, pos.y],
          style: options,
          authorId,
          status: "drawing",
        };

        strokesApi.startStroke(stroke);
      },

      onMove: ({ pos }) => {
        if (!activeStrokeId.current) return;
        strokesApi.updateStroke(activeStrokeId.current, pos);
      },

      onUp: () => {
        if (!activeStrokeId.current) return;
        strokesApi.endStroke(activeStrokeId.current);
        activeStrokeId.current = null;
      },
    },
  };
}
