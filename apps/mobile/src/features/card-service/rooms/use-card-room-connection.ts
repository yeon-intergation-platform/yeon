import {
  CARD_ROOM_EVENTS,
  CARD_ROOM_NAME,
  type CardRoomErrorMessage,
  type CardRoomRealtimeState,
  type CardRoomResult,
  type CardRoomRole,
} from "@yeon/race-shared";
import {
  createYeonRealtimeClient,
  type YeonRealtimeRoom,
} from "@yeon/ui/runtime/YeonRealtimeClient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveMobileRaceServerUrl } from "../../../services/card-rooms/race-server-url";

const CARD_ROOM_NETWORK_ERROR_PATTERNS = [
  "failed to fetch",
  "fetch failed",
  "networkerror",
  "load failed",
  "econnrefused",
] as const;

function normalizeConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  const lower = message.toLowerCase();
  if (CARD_ROOM_NETWORK_ERROR_PATTERNS.some((p) => lower.includes(p))) {
    return "카드방 연결에 실패했습니다. 잠시 후 다시 입장해 주세요.";
  }
  return message || "카드방에 연결하지 못했습니다.";
}

export type CardRoomConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "error"
  | "disconnected";

// 웹 useCardRoomConnection의 모바일 포팅(동일 colyseus 프로토콜).
export function useCardRoomConnection(
  roomId: string,
  participantId: string | null
) {
  const [state, setState] = useState<CardRoomRealtimeState | null>(null);
  const [connectionState, setConnectionState] =
    useState<CardRoomConnectionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const roomRef = useRef<YeonRealtimeRoom<CardRoomRealtimeState> | null>(null);

  useEffect(() => {
    if (!roomId || !participantId) return;
    let cancelled = false;
    setConnectionState("connecting");
    setError(null);
    const client = createYeonRealtimeClient(resolveMobileRaceServerUrl());
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
            setError(normalizeConnectionError(message || "카드방 연결 오류"));
            setConnectionState("error");
          }
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(normalizeConnectionError(err));
          setConnectionState("error");
        }
      });
    return () => {
      cancelled = true;
      roomRef.current?.leave();
      roomRef.current = null;
    };
  }, [roomId, participantId]);

  const sendChat = useCallback(
    (content: string) =>
      roomRef.current?.send(CARD_ROOM_EVENTS.CHAT, { content }),
    []
  );
  const sendResult = useCallback(
    (cardId: string, result: CardRoomResult) =>
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
    (role: CardRoomRole) =>
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

  return useMemo(
    () => ({
      state,
      connectionState,
      error,
      sendChat,
      sendResult,
      sendReveal,
      sendNext,
      sendRole,
      sendReady,
      sendStart,
      sendEnd,
    }),
    [
      state,
      connectionState,
      error,
      sendChat,
      sendResult,
      sendReveal,
      sendNext,
      sendRole,
      sendReady,
      sendStart,
      sendEnd,
    ]
  );
}
