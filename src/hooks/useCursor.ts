import { TOOLS } from "@/app/room/[roomid]/roomComponents/helpers/tools";
import { useEffect } from "react";


export default function useCursor(stageRef: any, tool: string) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const cursorMap: Record<string, string> = {
      [TOOLS.BRUSH]: "crosshair",
      [TOOLS.ERASER]: "crosshair",
      [TOOLS.SELECT]: "default",
      [TOOLS.TEXT]: "text",
      [TOOLS.LINE]: "crosshair",
      [TOOLS.RECT]: "crosshair",
      [TOOLS.ELLIPSE]: "crosshair",
      [TOOLS.HAND]: "grab",
      [TOOLS.ZOOMIN]: "zoom-in",
      [TOOLS.ZOOMOUT]: "zoom-out",
    };

    // Set initial cursor
    stage.container().style.cursor = cursorMap[tool] || "default";

    // Optional: change cursor dynamically during drag for hand tool
    if (tool === TOOLS.HAND) {
      const handleMouseDown = () => {
        stage.container().style.cursor = "grabbing";
      };
      const handleMouseUp = () => {
        stage.container().style.cursor = "grab";
      };

      stage.on("mousedown touchstart", handleMouseDown);
      stage.on("mouseup touchend", handleMouseUp);

      return () => {
        stage.off("mousedown touchstart", handleMouseDown);
        stage.off("mouseup touchend", handleMouseUp);
      };
    }
  }, [stageRef, tool]);
}
