"use client";

import {
  FaPaintBrush,
  FaEraser,
  FaMousePointer,
  FaFont,
  FaSlash,
  FaSquare,
  FaCircle,
  FaHandPaper
} from "react-icons/fa";
import { TOOLS } from "./helpers/tools";

export default function ToolsHeader({ tool, setTool }: any) {
  const Button = ({ value, icon }: any) => (
    <button
      onClick={() => setTool(value)}
      style={{
        background: tool === value ? "#73c2fb" : "#fff",
        border: "1px solid #ccc",
      }}
      className="p-2 rounded-full cursor-pointer"
    >
      {icon}
    </button>
  );

  return (
    <div className="liquidGlass-wrapper !fixed bottom-4 left-1/2  -translate-x-1/2 h-16 rounded-lg  p-1 flex  items-center justify-around  z-50 gap-2 ">
      <div className="liquidGlass-effect"></div>
      <div className="liquidGlass-tint"></div>
      <div className="liquidGlass-shine"></div>
      <div className="liquidGlass-text !flex  items-center  justify-around gap-2 px-2 ">
        <Button value={TOOLS.BRUSH} icon={<FaPaintBrush />} />
        <Button value={TOOLS.ERASER} icon={<FaEraser />} />
        <Button value={TOOLS.SELECT} icon={<FaMousePointer />} />
        <Button value={TOOLS.TEXT} icon={<FaFont />} />
        <Button value={TOOLS.LINE} icon={<FaSlash />} />
        <Button value={TOOLS.RECT} icon={<FaSquare />} />
        <Button value={TOOLS.ELLIPSE} icon={<FaCircle />} />
        <Button value={TOOLS.HAND} icon={<FaHandPaper />} />
      </div>
    </div>
  );
}
