// const ZOOM_STEP = 1.1;
// const MIN_ZOOM = 0.3;
// const MAX_ZOOM = 4;

// function applyZoom(
//   group: any,
//   stage: any,
//   direction: "in" | "out"
// ) {
//   if (!group || !stage) return;

//   const oldScale = group.scaleX();
//   const newScale =
//     direction === "in"
//       ? oldScale * ZOOM_STEP
//       : oldScale / ZOOM_STEP;

//   if (newScale < MIN_ZOOM || newScale > MAX_ZOOM) return;

//   const center = {
//     x: stage.width() / 2,
//     y: stage.height() / 2,
//   };

//   const pointTo = {
//     x: (center.x - group.x()) / oldScale,
//     y: (center.y - group.y()) / oldScale,
//   };

//   group.scale({ x: newScale, y: newScale });

//   group.position({
//     x: center.x - pointTo.x * newScale,
//     y: center.y - pointTo.y * newScale,
//   });

//   group.getLayer()?.batchDraw();
// }


// export function createZoomTools(
//   stageRef: any,
//   canvasGroupRef: any
// ) {
//   return {
//     zoomIn: {
//       onDown: () => {
//         applyZoom(canvasGroupRef.current, stageRef.current, "in");
//       },
//     },

//     zoomOut: {
//       onDown: () => {
//         applyZoom(canvasGroupRef.current, stageRef.current, "out");
//       },
//     },
//   };
// }
