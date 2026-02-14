"use client";

import { useEffect, useRef, useState } from "react";
import CanvasStage, { CanvasStageHandle } from "./roomComponents/canvas/CanvasStage";
import { BRUSH_TYPES, RoomUser } from "../../../../types";
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

  const [options, setOptions] = useState({
    color: "#333333",
    strokeWidth: 4,
    fontSize: 24,
    fontFamily: "Arial",
    fill: "#0000ff",
    brushCategory: BRUSH_TYPES.GENERAL,
  });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [roomName, setRoomName] = useState("");

  // ✅ pré-join
  const [username, setUsername] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [joinRequested, setJoinRequested] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const SIDEBAR_WIDTH = 190;
  const canvasRef = useRef<CanvasStageHandle | null>(null);

  // Charger username depuis localStorage au mount
  useEffect(() => {
    const saved = localStorage.getItem(USERNAME_KEY) || "";
    setUsername(saved);
    // si déjà un username => on peut demander join automatiquement
    if (saved.trim().length >= 3) setJoinRequested(true);
  }, []);

  // Handler pour lancer join (après submit form)
  const requestJoin = () => {
    const u = username.trim();
    if (u.length < 3) {
      setJoinError("The username must contain at least 3 characters.");
      return;
    }
    localStorage.setItem(USERNAME_KEY, u);
    setJoinError(null);
    setJoinRequested(true);
  };

  // Socket effect (listeners + join quand joinRequested=true)
  useEffect(() => {
    if (!socket || !roomid) return;

    const join = () => {
      const u = (localStorage.getItem(USERNAME_KEY) || "").trim();
      if (u.length < 3) return; // pas de join sans username valide

      socket.emit("room:join", { roomId: roomid, username: u });
    };

    const onError = (err: any) => {
      console.log("room:error", err);

      // Si erreur = room invalid/not found => retour join page
      if (err?.code === "ROOM_NOT_FOUND" || err?.code === "BAD_ROOM_ID") {
        router.replace("/join");
        return;
      }

      // Sinon afficher dans UI
      setJoinError(err?.code || "Erreur de connexion à la room");
      setJoinRequested(false);
      setHasJoined(false);
    };

    const onState = (data: any) => {
      setRoomName(data.roomName ?? "");
      setUsers(Array.isArray(data.users) ? data.users : []);
      setIsPublic(Boolean(data.isPublic));
      setOwnerId(data.ownerId ?? null);

      setHasJoined(true);
      setJoinError(null);
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

    // ✅ Join seulement si demandé
    if (joinRequested) {
      if (socket.connected) join();
      else socket.once("connect", join);
    }

    return () => {
      socket.off("room:error", onError);
      socket.off("room:state", onState);
      socket.off("room:users", onUsers);
      socket.off("room:visibility", onVisibility);
      socket.off("connect", join);
    };
  }, [socket, roomid, router, joinRequested]);

  // ✅ UI pré-join
  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#555] p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
          <div className="font-semibold text-lg">Join the room {roomName}
            {roomid && (
            <div className="mb-2 text-xs text-gray-500">
              Room ID: <span className="font-mono">{roomid}</span>
            </div>
          )}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Enter your username to continue.
          </div>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-4 w-full rounded-xl border px-4 py-2"
            placeholder="Your username (minimum 3 characters)"
            onKeyDown={(e) => {
              if (e.key === "Enter") requestJoin();
            }}
          />

          {joinError && <div className="mt-2 text-sm text-red-600">{joinError}</div>}

          <button
            onClick={requestJoin}
            className="mt-4 w-full rounded-md bg-primary py-2 text-white"
          >
            Join
          </button>

    
        </div>
      </div>
    );
  }

  // ✅ UI normale (whiteboard)
  return (
    <div className="flex h-full overflow-hidden relative bg-[#555]">
      {/* Toggle sidebar */}
      <button
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className={`absolute top-2 ${isSidebarOpen ? "left-[200px]" : "left-2"} z-50 text-block px-3 py-1 rounded-lg text-lg`}
      >
        {isSidebarOpen ? <GoSidebarExpand /> : <GoSidebarCollapse />}
      </button>

      {/* Sidebar */}
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

      {/* Invite button */}
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
        tool={tool}
        options={options}
        sidebarWidth={isSidebarOpen ? SIDEBAR_WIDTH : 0}
        socket={socket}
        roomid={roomid}
        ref={canvasRef}
      />

      <ToolsHeader tool={tool} setTool={setTool} />
    </div>
  );
}
