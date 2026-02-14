"use client";

import { Layer, Line, Rect, Ellipse, Text, Group } from "react-konva";
import type Konva from "konva";
import { Shape, transform as Transform } from "../../../../../../types";
import { getBrushLineProps } from "../helpers/Brushhelpers";

interface RenderLayerProps {
  shapes: Shape[];
  // updateShape sert UNIQUEMENT à changer le payload (géométrie/texte)
  updateShape: (id: string, payloadPatch: any, status?: "drawing" | "done") => void;
  // updateTransform sert UNIQUEMENT à changer transform (offset/rot/scale)
  updateTransform: (id: string, t: Transform, status?: "drawing" | "done") => void;
}

const DEFAULT_T: Required<Transform> = {
  x: 0,
  y: 0,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
};

export default function RenderLayer({ shapes, updateShape, updateTransform }: RenderLayerProps) {
  return (
    <Group>
      {shapes.map((shape) => {
        const style = shape.style;
        const t = { ...DEFAULT_T, ...(shape.transform ?? {}) };

        switch (shape.tool) {
          /* ===== BRUSH / ERASER ===== */
          case "brush": {
            const { points } = shape.payload;
            const brushProps = getBrushLineProps(shape.style); // style contient tes options de brush

            return (
              <Line
                key={shape.id}
                points={points}
                x={t.x ?? 0}
                y={t.y ?? 0}
                draggable= {false}
                {...brushProps}
                onDragEnd={(e) => {
                  const node = e.target as Konva.Line;
                  updateTransform(shape.id, { x: node.x(), y: node.y() }, "done");
                }}
              />
            );
          }
          case "eraser": {
            const { points } = shape.payload;

            return (
              <Line
                key={shape.id}
                points={points}
                x={t.x}
                y={t.y}
                stroke="#ffffff"
                strokeWidth={style?.strokeWidth ?? 2}
                opacity={style?.opacity ?? 1}
                lineCap="round"
                lineJoin="round"
                draggable= {false}
                globalCompositeOperation="source-over"
              
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
                  const node = e.target as Konva.Line;
                  updateTransform(shape.id, { x: node.x(), y: node.y() }, "done");
                }}
                onTransformEnd={(e) => {
                  const node = e.target as Konva.Line;
                  updateTransform(
                    shape.id,
                    {
                      x: node.x(),
                      y: node.y(),
                      rotation: node.rotation(),
                      scaleX: node.scaleX(),
                      scaleY: node.scaleY(),
                    },
                    "done"
                  );

                  // évite l’accumulation de scale si tu utilises Transformer
                  node.scaleX(1);
                  node.scaleY(1);
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
                x={x + t.x}
                y={y + t.y}
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
                  const node = e.target as Konva.Rect;
                  // offset = position finale - base payload
                  updateTransform(shape.id, { x: node.x() - x, y: node.y() - y }, "done");
                }}
                onTransformEnd={(e) => {
                  const node = e.target as Konva.Rect;

                  updateTransform(
                    shape.id,
                    {
                      x: node.x() - x,
                      y: node.y() - y,
                      rotation: node.rotation(),
                      scaleX: node.scaleX(),
                      scaleY: node.scaleY(),
                    },
                    "done"
                  );

                  node.scaleX(1);
                  node.scaleY(1);
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
                x={x + t.x}
                y={y + t.y}
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
                  const node = e.target as Konva.Ellipse;
                  updateTransform(shape.id, { x: node.x() - x, y: node.y() - y }, "done");
                }}
                onTransformEnd={(e) => {
                  const node = e.target as Konva.Ellipse;

                  updateTransform(
                    shape.id,
                    {
                      x: node.x() - x,
                      y: node.y() - y,
                      rotation: node.rotation(),
                      scaleX: node.scaleX(),
                      scaleY: node.scaleY(),
                    },
                    "done"
                  );

                  node.scaleX(1);
                  node.scaleY(1);
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
                x={x + t.x}
                y={y + t.y}
                text={text}
                rotation={t.rotation}
                scaleX={t.scaleX}
                scaleY={t.scaleY}
                fontSize={style?.fontSize ?? 18}
                fill={style?.color ?? "#000"}
                opacity={style?.opacity ?? 1}
                fontFamily={style?.fontFamily ?? "Arial"}
                draggable
                onDragEnd={(e) => {
                  const node = e.target as Konva.Text;
                  updateTransform(shape.id, { x: node.x() - x, y: node.y() - y }, "done");
                }}
                onTransformEnd={(e) => {
                  const node = e.target as Konva.Text;
                  updateTransform(
                    shape.id,
                    {
                      x: node.x() - x,
                      y: node.y() - y,
                      rotation: node.rotation(),
                      scaleX: node.scaleX(),
                      scaleY: node.scaleY(),
                    },
                    "done"
                  );
                  node.scaleX(1);
                  node.scaleY(1);
                }}
                onDblClick={(e) => {
                  const node = e.target as Konva.Text;
                  const stage = node.getStage();
                  if (!stage) return;

                  editTextNode(node, stage, (value) => {
                    // Ici: changement de contenu => payload
                    updateShape(shape.id, { ...shape.payload, text: value }, "done");
                  });
                }}
              />
            );
          }

          default:
            return null;
        }
      })}
    </Group>
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
