"use client";

import {
  FaEraser,
  FaMousePointer,
  FaFont,
  FaSlash,
  FaRegSquare,
  FaRegCircle ,
  FaHandPaper
} from "react-icons/fa";import { IoIosBrush } from "react-icons/io";
import { TOOLS } from "./helpers/tools";




type ToolsHeaderProps = {
  tool: string;
  setTool: React.Dispatch<React.SetStateAction<string>>;
};

type ButtonProps = {
  value: string;
  icon: React.ReactNode;
};


export default function ToolsHeader({ tool, setTool }: ToolsHeaderProps) {
  const Button = ({ value, icon }: ButtonProps) => (
    <button
      onClick={() => setTool(value)}
      style={{
        background: tool === value ? "#73c2fb" : "#fff",
        border: "1px solid #ccc",
      }}
      className="p-1 text-sm md:p-2 rounded-full cursor-pointer"
    >
      {icon}
    </button>
  );

  return (
    <div
  className="liquidGlass-wrapper    !fixed    bottom-2     right-2    md:left-1/2 md:right-auto md:-translate-x-1/2    h-auto md:h-16
    rounded-lg    p-1 md:p-2   flex    items-center justify-center md:justify-around    z-50
    gap-1 md:gap-2
  "
>
      <div className="liquidGlass-effect"></div>
      <div className="liquidGlass-tint"></div>
      <div className="liquidGlass-shine"></div>
      <div className="liquidGlass-text !flex  items-center  flex-col md:flex-row  justify-around gap-1 px-1 ">
        <Button value={TOOLS.BRUSH} icon={<IoIosBrush  />} />
        <Button value={TOOLS.ERASER} icon={<FaEraser />} />
        <Button value={TOOLS.SELECT} icon={<FaMousePointer />} />
        <Button value={TOOLS.TEXT} icon={<FaFont />} />
        <Button value={TOOLS.LINE} icon={<FaSlash />} />
        <Button value={TOOLS.RECT} icon={<FaRegSquare  />} />
        <Button value={TOOLS.ELLIPSE} icon={<FaRegCircle  />} />
        <Button value={TOOLS.HAND} icon={<FaHandPaper />} />
      </div>
    </div>
  );
}
