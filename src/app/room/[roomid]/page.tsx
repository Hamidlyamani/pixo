"use client";

import { useEffect, useState } from "react";
import CanvasStage from "./roomComponents/canvas/CanvasStage";
import { BRUSH_TYPES } from "../../../../types";
import ToolsHeader from "./roomComponents/ToolsHeader";
import Sidebar from "./roomComponents/Sidebar";
import { GoSidebarCollapse } from "react-icons/go";
import { GoSidebarExpand } from "react-icons/go";
import { getSocket } from "@/lib/socket";
import { useParams } from "next/navigation";




export default function RoomPage() {
  const [tool, setTool] = useState("brush");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [options, setOptions] = useState({
    color: "#333",
    strokeWidth: 4,
    fontSize: 24,
    fontFamily: "Arial",
    fill: "#0000ff",
    gradientFrom: "#ff0000",
    gradientTo: "#0000ff",
    brushCategory: BRUSH_TYPES.GENERAL,
  });

  const SIDEBAR_WIDTH = 190;

 const socket = getSocket();
 const { roomid } = useParams<{ roomid: string }>();

  // -------------------------
useEffect(() => {
  if (!socket) return;
    socket.emit("join-room", { roomid });
  
}, [socket, roomid]);



  return (
    <div className="flex h-full overflow-hidden relative bg-[#555]">
      {/* TOGGLE BUTTON (top-left) */}
      <button
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className={`absolute top-2 ${isSidebarOpen ? "left-[200px]" : "left-2"}  z-50 text-block px-3 py-1 rounded-lg text-lg`}
      >
        {isSidebarOpen ? <GoSidebarExpand /> : <GoSidebarCollapse />}
      </button>

      {/* SIDEBAR */}
      {isSidebarOpen && (
        <div style={{ width: SIDEBAR_WIDTH }} className="bg-blue-100">
          <div className="border-b border-white p-2 font-semibold text-xs bg-blue-200"> Tool options </div>
          <Sidebar tool={tool} options={options} setOptions={setOptions} />
        </div>
      )}
      <CanvasStage tool={tool} options={options} sidebarWidth={isSidebarOpen ? SIDEBAR_WIDTH : 0} socket={socket} roomid={roomid} />
      <ToolsHeader tool={tool} setTool={setTool} />
    </div>
  );
}
