"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Client, type Room } from "@colyseus/sdk";
import { useQuery } from "@tanstack/react-query";
import type {
  CardRoomListResponse,
  CardRoomParticipantResponse,
  CardRoomResponse,
  CreateCardRoomBody,
  JoinCardRoomBody,
} from "@yeon/api-contract/card-rooms";
import {
  CARD_ROOM_EVENTS,
  CARD_ROOM_NAME,
  type CardRoomErrorMessage,
  type CardRoomRealtimeState,
} from "@yeon/race-shared";

import { resolveRaceServerUrl } from "@/features/typing-service/use-race-room";

import { cardServiceFetchJson } from "../card-service-fetch";

export const cardRoomsQueryKey = () => ["card-rooms"] as const;

const CARD_ROOM_NETWORK_ERROR_PATTERNS = [
  "failed to fetch",
  "fetch failed",
  "networkerror",
  "load failed",
  "econnrefused",
] as const;

function normalizeCardRoomConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  const lowerMessage = message.toLowerCase();
  if (
    CARD_ROOM_NETWORK_ERROR_PATTERNS.some((pattern) =>
      lowerMessage.includes(pattern)
    )
  ) {
    return "카드방 연결에 실패했습니다. 잠시 후 다시 입장해 주세요.";
  }
  return message || "카드방에 연결하지 못했습니다.";
}

export function useCardRoomList() {
  return useQuery({
    queryKey: cardRoomsQueryKey(),
    queryFn: async () => {
      const data = await cardServiceFetchJson<CardRoomListResponse>(
        "/api/v1/card-rooms",
        { method: "GET" },
        "카드방 목록을 불러오지 못했습니다."
      );
      return data.rooms;
    },
  });
}

export async function createCardRoom(
  payload: CreateCardRoomBody,
  guestId: string
) {
  return cardServiceFetchJson<CardRoomResponse>(
    "/api/v1/card-rooms",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Yeon-Guest-Id": guestId,
      },
      body: JSON.stringify(payload),
    },
    "카드방을 만들지 못했습니다."
  );
}

export async function joinCardRoom(
  roomId: string,
  payload: JoinCardRoomBody,
  guestId: string
) {
  return cardServiceFetchJson<CardRoomParticipantResponse>(
    `/api/v1/card-rooms/${roomId}/participants`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Yeon-Guest-Id": guestId,
      },
      body: JSON.stringify(payload),
    },
    "카드방에 입장하지 못했습니다."
  );
}

export function useCardRoomConnection(
  roomId: string,
  participantId: string | null
) {
  const [state, setState] = useState<CardRoomRealtimeState | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [connectionState, setConnectionState] = useState<
    "idle" | "connecting" | "connected" | "error" | "disconnected"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    if (!roomId || !participantId) return;
    let cancelled = false;
    setConnectionState("connecting");
    setError(null);
    const client = new Client(resolveRaceServerUrl());
    client
      .joinOrCreate<CardRoomRealtimeState>(CARD_ROOM_NAME, {
        cardRoomId: roomId,
        participantId,
      })
      .then((room) => {
        if (cancelled) {
          room.leave();
          return;
        }
        roomRef.current = room;
        setRoom(room);
        setConnectionState("connected");
        if (room.state) setState(room.state as CardRoomRealtimeState);
        room.onMessage(CARD_ROOM_EVENTS.STATE, (next: CardRoomRealtimeState) =>
          setState(next)
        );
        room.onMessage(
          CARD_ROOM_EVENTS.ERROR,
          (message: CardRoomErrorMessage) => setError(message.message)
        );
        room.onLeave(() => {
          if (!cancelled) setConnectionState("disconnected");
        });
        room.onError((_code, message) => {
          if (!cancelled) {
            setError(
              normalizeCardRoomConnectionError(message || "카드방 연결 오류")
            );
            setConnectionState("error");
          }
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(normalizeCardRoomConnectionError(err));
          setConnectionState("error");
        }
      });
    return () => {
      cancelled = true;
      roomRef.current?.leave();
      roomRef.current = null;
      setRoom(null);
    };
  }, [roomId, participantId]);

  const sendChat = useCallback(
    (content: string) =>
      roomRef.current?.send(CARD_ROOM_EVENTS.CHAT, { content }),
    []
  );
  const sendResult = useCallback(
    (cardId: string, result: "OK" | "GIVE_UP" | "HINTED_OK") =>
      roomRef.current?.send(CARD_ROOM_EVENTS.RESULT, { cardId, result }),
    []
  );
  const sendReveal = useCallback(
    () => roomRef.current?.send(CARD_ROOM_EVENTS.REVEAL, {}),
    []
  );
  const sendNext = useCallback(
    () => roomRef.current?.send(CARD_ROOM_EVENTS.NEXT, {}),
    []
  );
  const sendRole = useCallback(
    (role: "MEMORIZER" | "CHECKER") =>
      roomRef.current?.send(CARD_ROOM_EVENTS.ROLE, { role }),
    []
  );
  const sendReady = useCallback(
    (isReady: boolean) =>
      roomRef.current?.send(CARD_ROOM_EVENTS.READY, { isReady }),
    []
  );
  const sendStart = useCallback(
    () => roomRef.current?.send(CARD_ROOM_EVENTS.START, {}),
    []
  );
  const sendEnd = useCallback(
    () => roomRef.current?.send(CARD_ROOM_EVENTS.END, {}),
    []
  );
  const sendLeave = useCallback(
    () => roomRef.current?.send(CARD_ROOM_EVENTS.LEAVE, {}),
    []
  );

  return useMemo(
    () => ({
      state,
      connectionState,
      error,
      room,
      sendChat,
      sendResult,
      sendReveal,
      sendNext,
      sendRole,
      sendReady,
      sendStart,
      sendEnd,
      sendLeave,
    }),
    [
      state,
      connectionState,
      error,
      room,
      sendChat,
      sendResult,
      sendReveal,
      sendNext,
      sendRole,
      sendReady,
      sendStart,
      sendEnd,
      sendLeave,
    ]
  );
}
