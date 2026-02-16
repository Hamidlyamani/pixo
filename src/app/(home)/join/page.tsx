"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SiGoogleclassroom } from "react-icons/si";
import { getSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";
import { montserrat } from "@/app/fonts";

type PublicRoomItem = {
  roomId: string;
  roomName: string;
  usersCount: number;
};

const USERNAME_KEY = "wb_username";

export default function HomeJoinBox() {
  const router = useRouter();

  // ✅ keep the socket stable (created once)
  const socketRef = useRef<Socket | null>(null);
  const [socketReady, setSocketReady] = useState(false);

  const [name, setName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [publicRooms, setPublicRooms] = useState<PublicRoomItem[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const canStart = useMemo(() => name.trim().length >= 3, [name]);
  const canJoinPublic = useMemo(() => name.trim().length >= 3, [name]);

  const saveUsername = (username: string) => {
    localStorage.setItem(USERNAME_KEY, username);
  };

  // ✅ init socket client-side only, once
  useEffect(() => {
    const s = getSocket(); // now guaranteed to run only in browser after mount
    socketRef.current = s;
    setSocketReady(true);

    return () => {
      // optional: if your getSocket creates a singleton, you may NOT want to disconnect here.
      // If it creates new socket per call, then disconnect is good.
      // socketRef.current?.disconnect();
      // socketRef.current = null;
    };
  }, []);

  // -----------------------------
  // Fetch public rooms
  // -----------------------------
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const requestRooms = () => {
      setLoadingRooms(true);
      socket.emit("public-rooms:get");
    };

    const onRoomsList = (rooms: PublicRoomItem[]) => {
      setPublicRooms(Array.isArray(rooms) ? rooms : []);
      setLoadingRooms(false);
    };

    socket.on("public-rooms:list", onRoomsList);

    if (socket.connected) requestRooms();
    else socket.on("connect", requestRooms);

    return () => {
      socket.off("public-rooms:list", onRoomsList);
      socket.off("connect", requestRooms);
    };
  }, [socketReady]);

  const createRoom = () => {
    const socket = socketRef.current;
    if (!socket) return;

    if (!canStart) return;

    const username = name.trim();
    const rName = roomName.trim();
    if (!username) return;

    saveUsername(username);

    const onCreated = ({ roomId }: { roomId: string }) => {
      cleanup();
      router.push(`/room/${roomId}`);
    };

    const onError = (err: string) => {
      cleanup();
      console.log("room:error", err);
    };

    const cleanup = () => {
      socket.off("room:created", onCreated);
      socket.off("room:error", onError);
    };

    socket.on("room:created", onCreated);
    socket.on("room:error", onError);

    socket.emit("room:create", {
      roomName: rName || "Untitled room",
      username,
      isPublic: true,
    });
  };

  const joinPublicRoom = (roomId: string) => {
    const socket = socketRef.current;
    if (!socket) return;

    if (!canJoinPublic) return;

    const username = name.trim();
    if (!username) return;

    saveUsername(username);

    const onState = () => {
      cleanup();
      router.push(`/room/${roomId}`);
    };

    const onError = (err: string) => {
      cleanup();
      console.log("room:error", err);
    };

    const cleanup = () => {
      socket.off("room:state", onState);
      socket.off("room:error", onError);
    };

    socket.on("room:state", onState);
    socket.on("room:error", onError);

    socket.emit("room:join", { roomId, username });
  };

  return (
    <div
      className={` ${montserrat.className} 
    w-[92vw] max-w-xl
    rounded-md sm:rounded-lg
    border border-black/10 bg-white/80
    p-4 sm:p-5
    shadow-[0_18px_50px_rgba(0,0,0,0.12)]
    backdrop-blur-xl
  `}
    >
      {/* Player name */}
      <div>
        <label className="block text-sm font-medium text-black/60">
          Your username
        </label>
        <div className="mt-1 flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2">
          <span className="text-black/30">👤</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hamido"
            className="w-full bg-transparent text-sm outline-none placeholder:text-black/30"
            maxLength={20}
          />
        </div>
        <p className="mt-1 text-[11px] text-black/35">Min 3 chars.</p>
      </div>

      {/* Room name */}
      <div className="mt-3">
        <label className="block text-sm  font-medium text-black/60">
          Room name <span className="text-black/35 text-xs">(optional)</span>
        </label>
        <div className="mt-1 flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2">
          <span className="text-black/30">
            <SiGoogleclassroom />
          </span>
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="e.g. Team brainstorm"
            className="w-full bg-transparent text-sm outline-none placeholder:text-black/30"
            maxLength={30}
          />
        </div>
      </div>

      {/* Create */}
      <button
        onClick={createRoom}
        disabled={!canStart}
        className="mt-4 w-full rounded-xl bg-primary py-2 text-sm font-semibold text-white hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Start a room
      </button>

      {/* Divider */}
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-black/10" />
        <span className="text-xs font-medium text-black/40">
          Or join a public room
        </span>
        <div className="h-px flex-1 bg-black/10" />
      </div>

      {/* Public rooms list */}
      <div className="rounded-lg border border-black/10 bg-white/70">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-semibold text-black/60">Public rooms</span>

          <button
            type="button"
            onClick={() => {
              const s = socketRef.current;
              if (!s) return;            // socket not ready yet
              setLoadingRooms(true);     // optional: show spinner immediately
              s.emit("public-rooms:get");
            }}
            className="text-[11px] font-medium text-black/40 hover:text-black/55"
            disabled={!socketReady}
          >

            {loadingRooms ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="max-h-40 sm:max-h-44 overflow-y-auto px-2 pb-2">
          <div className="space-y-2">
            {publicRooms.length === 0 && !loadingRooms && (
              <div className="px-2 py-3 text-[11px] text-black/40">
                No public rooms available right now.
              </div>
            )}

            {publicRooms.map((r) => {
              const full = r.usersCount >= 5;

              return (
                <button
                  key={r.roomId}
                  onClick={() => joinPublicRoom(r.roomId)}
                  disabled={full || !canJoinPublic}
                  className="flex w-full items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-2 text-left hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-black/80">
                      {r.roomName || "Untitled room"}
                    </div>
                    <div className="text-[11px] text-black/35">
                      {r.roomId} • {r.usersCount}/5 players
                    </div>
                  </div>

                  <span className="text-black/30">›</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-black/35">
        Tip: your name is required to join.
      </p>
    </div>

  );
}
