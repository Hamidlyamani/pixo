"use client";

import { Line, Rect, Ellipse, Text, Group } from "react-konva";
import { Shape, transform as Transform } from "../../../../../../types";
import { getBrushLineProps } from "../helpers/Brushhelpers";
import Konva from "konva";
import { editTextNode } from "../helpers/textEditor";

interface RenderLayerProps {
  shapes: Shape[];
  // updateShape sert UNIQUEMENT à changer le payload (géométrie/texte)
  updateShape: (id: string, payloadPatch: Shape["payload"], status?: "drawing" | "done") => void;
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
                draggable={false}
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

                draggable={false}
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
                stroke={style?.color ?? "#111111"}
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
                stroke={style?.color ?? "#111111"}
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
                stroke={style?.color ?? "#111111"}
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
            const lastTapRef = { id: "", t: 0 };

            const isTextNode = (node: Konva.Node): node is Konva.Text =>
              node.getClassName() === "Text";

            const tryOpenEditor = (node: Konva.Node) => {
              if (!isTextNode(node)) return;

              const stage = node.getStage();
              if (!stage) return;

              editTextNode(node, stage, (value: string) => {
                updateShape(shape.id, { ...shape.payload, text: value }, "done");
              });
            };
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
                fill={style?.color ?? "#111111"}
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
                onPointerDown={(e) => {
                  const node = e.target;
                  if (node.getClassName?.() !== "Text") return;

                  const now = Date.now();
                  const same = lastTapRef.id === shape.id;
                  const fast = now - lastTapRef.t < 300; // 250-350ms

                  if (same && fast) {
                    // ✅ double click/tap détecté
                    tryOpenEditor(node);

                    // reset pour éviter triple
                    lastTapRef.id = "";
                    lastTapRef.t = 0;
                    return;
                  }

                  lastTapRef.id = shape.id;
                  lastTapRef.t = now;
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


