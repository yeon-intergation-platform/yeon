"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Client, type Room } from "@colyseus/sdk";
import { useQuery } from "@tanstack/react-query";
import type { CardRoomListResponse, CardRoomResponse, CardRoomParticipantResponse, CreateCardRoomBody, JoinCardRoomBody } from "@yeon/api-contract/card-rooms";
import { CARD_ROOM_EVENTS, CARD_ROOM_NAME, type CardRoomErrorMessage, type CardRoomRealtimeState } from "@yeon/race-shared";
import { resolveRaceServerUrl } from "@/features/typing-service/use-race-room";

export function useCardRoomList() {
  return useQuery({
    queryKey: ["card-rooms"],
    queryFn: async () => {
      const response = await fetch("/api/v1/card-rooms", { credentials: "include" });
      if (!response.ok) throw new Error("카드방 목록을 불러오지 못했습니다.");
      const data = (await response.json()) as CardRoomListResponse;
      return data.rooms;
    },
  });
}

export async function createCardRoom(payload: CreateCardRoomBody, guestId: string) {
  const response = await fetch("/api/v1/card-rooms", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "X-Yeon-Guest-Id": guestId }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(((await response.json().catch(() => null)) as { message?: string } | null)?.message ?? "카드방을 만들지 못했습니다.");
  return (await response.json()) as CardRoomResponse;
}

export async function joinCardRoom(roomId: string, payload: JoinCardRoomBody, guestId: string) {
  const response = await fetch(`/api/v1/card-rooms/${roomId}/participants`, { method: "POST", credentials: "include", headers: { "content-type": "application/json", "X-Yeon-Guest-Id": guestId }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(((await response.json().catch(() => null)) as { message?: string } | null)?.message ?? "카드방에 입장하지 못했습니다.");
  return (await response.json()) as CardRoomParticipantResponse;
}

export function useCardRoomConnection(roomId: string, participantId: string | null) {
  const [state, setState] = useState<CardRoomRealtimeState | null>(null);
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "connected" | "error" | "disconnected">("idle");
  const [error, setError] = useState<string | null>(null);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    if (!roomId || !participantId) return;
    let cancelled = false;
    setConnectionState("connecting");
    setError(null);
    const client = new Client(resolveRaceServerUrl());
    client.joinOrCreate<CardRoomRealtimeState>(CARD_ROOM_NAME, { cardRoomId: roomId, participantId })
      .then((room) => {
        if (cancelled) { room.leave(); return; }
        roomRef.current = room;
        setConnectionState("connected");
        if (room.state) setState(room.state as CardRoomRealtimeState);
        room.onMessage(CARD_ROOM_EVENTS.STATE, (next: CardRoomRealtimeState) => setState(next));
        room.onMessage(CARD_ROOM_EVENTS.ERROR, (message: CardRoomErrorMessage) => setError(message.message));
        room.onLeave(() => { if (!cancelled) setConnectionState("disconnected"); });
        room.onError((_code, message) => { if (!cancelled) { setError(String(message || "카드방 연결 오류")); setConnectionState("error"); } });
      })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : "카드방에 연결하지 못했습니다."); setConnectionState("error"); } });
    return () => { cancelled = true; roomRef.current?.leave(); roomRef.current = null; };
  }, [roomId, participantId]);

  const sendChat = useCallback((content: string) => roomRef.current?.send(CARD_ROOM_EVENTS.CHAT, { content }), []);
  const sendResult = useCallback((cardId: string, result: "OK" | "GIVE_UP" | "HINTED_OK") => roomRef.current?.send(CARD_ROOM_EVENTS.RESULT, { cardId, result }), []);
  const sendReveal = useCallback(() => roomRef.current?.send(CARD_ROOM_EVENTS.REVEAL, {}), []);
  const sendNext = useCallback(() => roomRef.current?.send(CARD_ROOM_EVENTS.NEXT, {}), []);
  const sendRole = useCallback((role: "MEMORIZER" | "CHECKER") => roomRef.current?.send(CARD_ROOM_EVENTS.ROLE, { role }), []);

  return useMemo(() => ({ state, connectionState, error, sendChat, sendResult, sendReveal, sendNext, sendRole }), [state, connectionState, error, sendChat, sendResult, sendReveal, sendNext, sendRole]);
}
