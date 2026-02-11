"use client";

import {
  Layer,
  Line,
  Rect,
  Ellipse,
  Text,
} from "react-konva";
import { Shape } from "../../../../../../types";

interface RenderLayerProps {
  shapes: Shape[];
  updateShape: any;
}

export default function RenderLayer({ shapes, updateShape }: RenderLayerProps) {
  return (
    <Layer>
      {shapes.map((shape) => {
        const style = shape.style;
        const t = shape.transform ?? { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };

        switch (shape.tool) {
          /* ===== BRUSH / ERASER ===== */
          case "brush":
          case "eraser": {
            const { points } = shape.payload;
            return (
              <Line
                key={shape.id}
                points={points}
                x={t.x}
                y={t.y}
                stroke={style?.color ?? "#000"}
                strokeWidth={style?.strokeWidth ?? 2}
                opacity={style?.opacity ?? 1}
                lineCap="round"
                lineJoin="round"
                draggable
                globalCompositeOperation={
                  shape.tool === "eraser" ? "destination-out" : "source-over"
                }
                onDragEnd={(e) => {
                  updateShape(shape.id, {
                    transform: { ...t, x: e.target.x(), y: e.target.y() }
                  });
                }}
              />
            );
          }

          /* ===== LINE ===== */
          case "line": {
            const { x1, y1, x2, y2 } = shape.payload;
            return (
              <Line
                key={shape.id}
                points={[x1, y1, x2, y2]}
                x={t.x}
                y={t.y}
                rotation={t.rotation}
                stroke={style?.color ?? "#000"}
                strokeWidth={style?.strokeWidth ?? 2}
                opacity={style?.opacity ?? 1}
                lineCap="round"
                draggable
                onDragEnd={(e) => {
                  updateShape(shape.id, {
                    transform: { ...t, x: e.target.x(), y: e.target.y() }
                  });
                }}
              />
            );
          }

          /* ===== RECT ===== */
          case "rect": {
            const { x, y, width, height } = shape.payload;
            return (
              <Rect
                key={shape.id}
                x={x + (t.x ?? 0)}
                y={y + (t.y ?? 0)}
                width={width}
                height={height}
                rotation={t.rotation}
                scaleX={t.scaleX}
                scaleY={t.scaleY}
                stroke={style?.color ?? "#000"}
                strokeWidth={style?.strokeWidth ?? 2}
                fill={style?.fill}
                opacity={style?.opacity ?? 1}
                draggable
                onDragEnd={(e) => {
                  updateShape(shape.id, {
                    transform: { ...t, x: e.target.x() - x, y: e.target.y() - y }
                  });
                }}
                onTransformEnd={(e) => {
                  const node = e.target;
                  updateShape(shape.id, {
                    transform: {
                      x: node.x() - x,
                      y: node.y() - y,
                      rotation: node.rotation(),
                      scaleX: node.scaleX(),
                      scaleY: node.scaleY(),
                    }
                  });
                }}
              />
            );
          }

          /* ===== ELLIPSE ===== */
          case "ellipse": {
            const { x, y, radiusX, radiusY } = shape.payload;
            return (
              <Ellipse
                key={shape.id}
                x={x + (t.x ?? 0)}
                y={y + (t.y ?? 0)}
                radiusX={radiusX}
                radiusY={radiusY}
                rotation={t.rotation}
                scaleX={t.scaleX}
                scaleY={t.scaleY}
                stroke={style?.color ?? "#000"}
                strokeWidth={style?.strokeWidth ?? 2}
                fill={style?.fill}
                opacity={style?.opacity ?? 1}
                draggable
                onDragEnd={(e) => {
                  updateShape(shape.id, {
                    transform: { ...t, x: e.target.x() - x, y: e.target.y() - y }
                  });
                }}
                onTransformEnd={(e) => {
                  const node = e.target;
                  updateShape(shape.id, {
                    transform: {
                      x: node.x() - x,
                      y: node.y() - y,
                      rotation: node.rotation(),
                      scaleX: node.scaleX(),
                      scaleY: node.scaleY(),
                    }
                  });
                }}
              />
            );
          }

          /* ===== TEXT ===== */
          case "text": {
            const { x, y, text } = shape.payload;
            return (
              <Text
                key={shape.id}
                x={x + (t.x ?? 0)}
                y={y + (t.y ?? 0)}
                text={text}
                rotation={t.rotation}
                scaleX={t.scaleX}
                scaleY={t.scaleY}
                fontSize={style?.fontSize ?? 18}
                fill={style?.color ?? "#000"}
                opacity={style?.opacity ?? 1}
                draggable
                onDragEnd={(e) => {
                  updateShape(shape.id, {
                    transform: { ...t, x: e.target.x() - x, y: e.target.y() - y }
                  });
                }}
                onDblClick={(e) => {
                  const node = e.target;
                  const stage = node.getStage();
                  if (!stage) return;
                  editTextNode(node, stage, (value) => {
                    updateShape(shape.id, { payload: { ...shape.payload, text: value } }, "done");
                  });
                }}
              />
            );
          }

          default:
            return null;
        }
      })}
    </Layer>
  );
}



function editTextNode(textNode: any, stage: any, onCommit: (value: string) => void) {
  const textPosition = textNode.absolutePosition();
  const stageBox = stage.container().getBoundingClientRect();

  const textarea = document.createElement("textarea");
  document.body.appendChild(textarea);

  textarea.value = textNode.text();
  textarea.style.position = "absolute";
  textarea.style.top = stageBox.top + textPosition.y + "px";
  textarea.style.left = stageBox.left + textPosition.x + "px";
  textarea.style.width = textNode.width() + "px";
  textarea.style.fontSize = textNode.fontSize() + "px";
  textarea.style.fontFamily = textNode.fontFamily();
  textarea.style.color = textNode.fill();
  textarea.style.border = "1px solid #eee";
  textarea.style.padding = "4px";
  textarea.style.outline = "none";
  textarea.style.resize = "none";
  textarea.style.background = "white";
  textarea.style.zIndex = "1000";

  textarea.focus();
  textNode.visible(false);
  textNode.getLayer().draw();

  const finish = () => {
    const v = textarea.value;
    textarea.remove();
    textNode.visible(true);
    textNode.getLayer().draw();
    onCommit(v);
  };

  textarea.addEventListener("blur", finish);
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textarea.blur();
    }
    if (e.key === "Escape") {
      textarea.value = textNode.text();
      textarea.blur();
    }
  });
}