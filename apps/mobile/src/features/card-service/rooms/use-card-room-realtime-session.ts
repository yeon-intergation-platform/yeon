import {
  CARD_ROOM_EVENTS,
  CARD_ROOM_NAME,
  type CardRoomErrorMessage,
  type CardRoomRealtimeState,
} from "@yeon/race-shared";
import {
  createYeonRealtimeClient,
  ensureYeonRealtimeSeatReservationCompat,
  type YeonRealtimeRoom,
} from "@yeon/ui/runtime/YeonRealtimeClient";
import { useEffect, useRef, useState } from "react";

import { resolveMobileRaceServerUrl } from "../../../services/card-rooms/race-server-url";
import { normalizeCardRoomConnectionError } from "./card-room-connection-errors";
import type { CardRoomConnectionState } from "./use-card-room-connection";

function leaveRoomSafely(
  room: YeonRealtimeRoom<CardRoomRealtimeState>,
  reason: string
) {
  room.leave().catch((leaveError: unknown) => {
    console.warn(reason, leaveError);
  });
}

export function useCardRoomRealtimeSession({
  participantId,
  participantToken,
  roomId,
}: {
  participantId: string | null;
  participantToken: string | null;
  roomId: string;
}) {
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
          leaveRoomSafely(
            room,
            "[CardRoomConnection] 취소된 방 연결 정리 실패"
          );
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
      // idx-121: leave() Promise 거부를 무해 처리해 unhandled rejection 경고 방지.
      if (roomRef.current) {
        leaveRoomSafely(
          roomRef.current,
          "[CardRoomConnection] 방 연결 cleanup leave 실패"
        );
      }
      roomRef.current = null;
    };
  }, [roomId, participantId, participantToken]);

  return { connectionState, error, roomRef, state };
}
