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
  ensureYeonRealtimeSeatReservationCompat,
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

function getConnectionErrorCauseMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error.trim();
  }

  return `처리할 수 없는 오류 형식(${String(error)})`;
}

function normalizeConnectionError(error: unknown) {
  const message = getConnectionErrorCauseMessage(error);
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
// finding 166: participantToken을 join 옵션으로 전달해 race-server가 참가자 가장을 검증한다.
export function useCardRoomConnection(
  roomId: string,
  participantId: string | null,
  participantToken: string | null
) {
  const [state, setState] = useState<CardRoomRealtimeState | null>(null);
  const [connectionState, setConnectionState] =
    useState<CardRoomConnectionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const roomRef = useRef<YeonRealtimeRoom<CardRoomRealtimeState> | null>(null);

  useEffect(() => {
    if (!roomId || !participantId) return;
    let cancelled = false;
    // idx-120: colyseus seat reservation 호환 패치를 웹/모바일 일관 적용.
    ensureYeonRealtimeSeatReservationCompat();
    setConnectionState("connecting");
    setError(null);
    const client = createYeonRealtimeClient(resolveMobileRaceServerUrl());
    client
      .joinOrCreate<CardRoomRealtimeState>(CARD_ROOM_NAME, {
        cardRoomId: roomId,
        participantId,
        participantToken: participantToken ?? undefined,
      })
      .then((room) => {
        if (cancelled) {
          room.leave().catch((leaveError: unknown) => {
            console.warn(
              "[CardRoomConnection] 취소된 방 연결 정리 실패",
              leaveError
            );
          });
          return;
        }
        roomRef.current = room;
        setConnectionState("connected");
        if (room.state) setState(room.state as CardRoomRealtimeState);
        // idx-114: cleanup 이후 inflight 메시지가 이전 방 상태를 덮어쓰지 않도록 가드.
        room.onMessage(
          CARD_ROOM_EVENTS.STATE,
          (next: CardRoomRealtimeState) => {
            if (!cancelled) setState(next);
          }
        );
        room.onMessage(
          CARD_ROOM_EVENTS.ERROR,
          (message: CardRoomErrorMessage) => {
            if (!cancelled) setError(message.message);
          }
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
      // idx-121: leave() Promise 거부를 무해 처리해 unhandled rejection 경고 방지.
      roomRef.current?.leave().catch((leaveError: unknown) => {
        console.warn(
          "[CardRoomConnection] 방 연결 cleanup leave 실패",
          leaveError
        );
      });
      roomRef.current = null;
    };
  }, [roomId, participantId, participantToken]);

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
  // idx-113: 웹 훅과 표면을 맞추기 위해 sendLeave 추가.
  const sendLeave = useCallback(
    () => roomRef.current?.send(CARD_ROOM_EVENTS.LEAVE, {}),
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
      sendLeave,
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
      sendLeave,
    ]
  );
}
