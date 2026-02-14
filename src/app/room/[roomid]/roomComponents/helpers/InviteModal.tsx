"use client";

import { useEffect, useMemo, useState } from "react";

type InviteModalProps = {
  open: boolean;
  onClose: () => void;
  socket: any;
  roomId: string;
  ownerId: string | null;
  isPublic: boolean;
  setIsPublic: (v: boolean) => void;
};

export default function InviteModal({
  open,
  onClose,
  socket,
  roomId,
  ownerId,
  isPublic,
  setIsPublic,
}: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const [loadingVis, setLoadingVis] = useState(false);


  const link = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/room/${roomId}`;
  }, [roomId]);

  const isOwner = socket?.id && ownerId && socket.id === ownerId;

  useEffect(() => {
    if (!open || !socket) return;
    socket.emit("room:get-invite", { roomId });

    const onInvite = (data: any) => {
      if (typeof data?.isPublic === "boolean") setIsPublic(data.isPublic);
    };

    const onError = (err: any) => {
      console.log("room:error", err);
    };

    socket.on("room:invite", onInvite);
    socket.on("room:error", onError);

    return () => {
      socket.off("room:invite", onInvite);
      socket.off("room:error", onError);
    };
  }, [open, socket, roomId, setIsPublic]);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback simple
      console.log("Impossible de copier (permission navigateur)");
    }
  };

  const togglePublic = (next: boolean) => {
    if (!socket) return;
    if (!isOwner) return; // UI guard (le serveur bloque aussi)

    setLoadingVis(true);
    socket.emit("room:set-public", { roomId, isPublic: next });

    // On attend room:visibility pour confirmer (meilleur)
    const onVis = (data: any) => {
      if (data?.roomId === roomId) {
        setIsPublic(Boolean(data.isPublic));
        setLoadingVis(false);
        socket.off("room:visibility", onVis);
      }
    };

    const onError = (err: any) => {
      console.log("room:error", err);
      setLoadingVis(false);
      socket.off("room:error", onError);
    };

    socket.on("room:visibility", onVis);
    socket.on("room:error", onError);
  };

  return (
    <div className="fixed inset-0 z-50  flex items-start justify-end bg-black/40">
      <div className="w-full max-w-md mr-4 mt-16 rounded-md bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Inviter</div>
          <button onClick={onClose} className="px-2 py-1 rounded-lg bg-gray-100">
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Lien */}
          <div>
            <div className="text-sm font-medium mb-1">Lien d’invitation</div>
            <div className="flex gap-2">
              <input
                value={link}
                readOnly
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <button
                onClick={copy}
                className="rounded-lg bg-black px-3 py-2 text-sm text-white"
              >
                {copied ? "Copié" : "Copier"}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Toute personne avec ce lien peut rejoindre la room.
            </div>
          </div>

          {/* Visibilité */}
          <div className="rounded-xl border p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Room publique</div>
                <div className="text-xs text-gray-500">
                  Visible dans la liste publique.
                </div>
              </div>

              <button
                disabled={!isOwner || loadingVis}
                onClick={() => togglePublic(!isPublic)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  isPublic ? "bg-green-600 text-white" : "bg-gray-200"
                } ${(!isOwner) ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isPublic ? "Activée" : "Désactivée"}
              </button>
            </div>

            {!isOwner && (
              <div className="mt-2 text-xs text-red-600">
                Seul le propriétaire peut changer la visibilité.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
