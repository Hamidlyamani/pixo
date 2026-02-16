"use client";

import { useEffect, useRef, useState } from "react";
import CanvasStage, { CanvasStageHandle } from "./roomComponents/canvas/CanvasStage";
import {  RoomUser, ToolOptions } from "../../../../types";
import ToolsHeader from "./roomComponents/ToolsHeader";
import Sidebar from "./roomComponents/Sidebar";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { getSocket } from "@/lib/socket";
import { useRouter, useParams } from "next/navigation";
import InviteModal from "./roomComponents/helpers/InviteModal";

const USERNAME_KEY = "wb_username";

export default function RoomPage() {
  const router = useRouter();
  const { roomid } = useParams<{ roomid: string }>();
  const socket = getSocket();

  const [tool, setTool] = useState("brush");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);


  useEffect(() => {
    const update = (): void => {
      const isMobile = window.innerWidth <= 768; // simple et fiable
      const portrait = window.innerHeight > window.innerWidth; // fiable en DevTools
      setIsPortraitMobile(isMobile && portrait);
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);



const [options, setOptions] = useState<ToolOptions>({
  color: "#000",
  strokeWidth: 2,
  fontSize: 18,
  fontFamily: "Arial",
  fill: "transparent",
  brushCategory: "general",
});

  const [inviteOpen, setInviteOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [users, setUsers] = useState<RoomUser[]>([]);

  // ✅ pré-join
  const [username, setUsername] = useState("");
  const [canJoin, setCanJoin] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const SIDEBAR_WIDTH = 190;
  const canvasRef = useRef<CanvasStageHandle | null>(null);

  // load username (client only)
  useEffect(() => {
    const saved = localStorage.getItem(USERNAME_KEY) || "";
    setUsername(saved);

    // si déjà valid, autoriser join (CanvasStage fera le join)
    if (saved.trim().length >= 3) setCanJoin(true);
  }, []);

  const requestJoin = () => {
    const u = username.trim();
    if (u.length < 3) {
      setJoinError("The username must contain at least 3 characters.");
      return;
    }
    localStorage.setItem(USERNAME_KEY, u);
    setJoinError(null);
    setCanJoin(true);
  };

  // ✅ listeners UI room (pas de join ici)
  useEffect(() => {
    if (!socket || !roomid) return;

    type RoomError = {
      code?: string;
      message?: string;
    }

    interface RoomUser {
      id: string;
      name: string;
    }

    interface RoomState {
      roomName?: string;
      users?: RoomUser[];
      isPublic?: boolean;
      ownerId?: string | null;
    }

    const onError = (err: RoomError): void => {
      console.log("room:error", err);

      if (err.code === "ROOM_NOT_FOUND" || err.code === "BAD_ROOM_ID") {
        router.replace("/join");
        return;
      }

      setJoinError(err.code ?? "Erreur");
      setCanJoin(false);
    };

    const onState = (data: RoomState) => {
      // UI seulement (pas shapes ici)
      setUsers(Array.isArray(data.users) ? data.users : []);
      setIsPublic(Boolean(data.isPublic));
      setOwnerId(data.ownerId ?? null);
    };

    const onUsers = (data: { roomId: string; users: RoomUser[] }) => {
      if (data?.roomId && data.roomId !== roomid) return;
      setUsers(Array.isArray(data.users) ? data.users : []);
    };

    const onVisibility = (data: { roomId: string; isPublic: boolean }) => {
      if (data?.roomId !== roomid) return;
      setIsPublic(Boolean(data.isPublic));
    };

    socket.on("room:error", onError);
    socket.on("room:state", onState);
    socket.on("room:users", onUsers);
    socket.on("room:visibility", onVisibility);

    return () => {
      socket.off("room:error", onError);
      socket.off("room:state", onState);
      socket.off("room:users", onUsers);
      socket.off("room:visibility", onVisibility);
    };
  }, [socket, roomid, router]);

  // ✅ afficher form tant que canJoin=false
  if (!canJoin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#555] p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
          <div className="font-semibold text-lg">
            Join the room
            {roomid && (
              <div className="mt-1 text-xs text-gray-500">
                Room ID: <span className="font-mono">{roomid}</span>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 mt-2">
            Enter your username to continue.
          </div>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-4 w-full rounded-xl border px-4 py-2"
            placeholder="Your username (min 3 chars)"
            onKeyDown={(e) => {
              if (e.key === "Enter") requestJoin();
            }}
          />

          {joinError ? (
            <div className="mt-2 text-sm text-red-600">
              {joinError}
            </div>
          ) : null}
          <button
            onClick={() => requestJoin()}
            className="mt-4 w-full rounded-md bg-primary py-2 text-white"
          >
            Join
          </button>
        </div>
      </div>
    );
  }

 return isPortraitMobile ? (
  <div className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-6">
    <div className="max-w-sm text-center text-white">
      <div className="text-xl font-semibold">Tourne ton téléphone</div>
      <div className="mt-2 text-sm opacity-90">
        Utilise le mode paysage pour le whiteboard.
      </div>
    </div>
  </div>
) :  (
    <div className="flex h-full overflow-hidden relative bg-[#555]">
      <button
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className={`absolute top-2 ${isSidebarOpen ? "left-[200px]" : "left-2"} z-50 text-block px-3 py-1 rounded-lg text-lg`}
      >
        {isSidebarOpen ? <GoSidebarExpand /> : <GoSidebarCollapse />}
      </button>

      {isSidebarOpen && (
        <div style={{ width: SIDEBAR_WIDTH }} className="bg-blue-100">
          <Sidebar
            options={options}
            setOptions={setOptions}
            onExportJpg={() => canvasRef.current?.exportJpg()}
            users={users}
            mySocketId={socket?.id}
            ownerId={ownerId}
          />
        </div>
      )}

      <button
        onClick={() => setInviteOpen(true)}
        className="absolute top-4 right-4 px-6 py-2 uppercase font-bold rounded-sm bg-primary text-white z-50 !cursor-pointer"
      >
        Invite
      </button>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        socket={socket}
        roomId={roomid}
        ownerId={ownerId}
        isPublic={isPublic}
        setIsPublic={setIsPublic}
      />

      <CanvasStage
        ref={canvasRef}
        tool={tool}
        options={options}
        sidebarWidth={isSidebarOpen ? SIDEBAR_WIDTH : 0}
        socket={socket}
        roomid={roomid}
        canJoin={canJoin}
        username={(localStorage.getItem(USERNAME_KEY) || username).trim()}
      />

      <ToolsHeader tool={tool} setTool={setTool} />
    </div>
  );
}
