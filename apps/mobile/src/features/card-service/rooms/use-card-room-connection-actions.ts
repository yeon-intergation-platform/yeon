import {
  CARD_ROOM_EVENTS,
  type CardRoomRealtimeState,
  type CardRoomResult,
  type CardRoomRole,
} from "@yeon/race-shared";
import type { YeonRealtimeRoom } from "@yeon/ui/runtime/YeonRealtimeClient";
import { useCallback, useMemo, type RefObject } from "react";

export function useCardRoomConnectionActions(
  roomRef: RefObject<YeonRealtimeRoom<CardRoomRealtimeState> | null>
) {
  const sendChat = useCallback(
    (content: string) =>
      roomRef.current?.send(CARD_ROOM_EVENTS.CHAT, { content }),
    [roomRef]
  );
  const sendResult = useCallback(
    (cardId: string, result: CardRoomResult) =>
      roomRef.current?.send(CARD_ROOM_EVENTS.RESULT, { cardId, result }),
    [roomRef]
  );
  const sendReveal = useCallback(
    () => roomRef.current?.send(CARD_ROOM_EVENTS.REVEAL, {}),
    [roomRef]
  );
  const sendNext = useCallback(
    () => roomRef.current?.send(CARD_ROOM_EVENTS.NEXT, {}),
    [roomRef]
  );
  const sendRole = useCallback(
    (role: CardRoomRole) =>
      roomRef.current?.send(CARD_ROOM_EVENTS.ROLE, { role }),
    [roomRef]
  );
  const sendReady = useCallback(
    (isReady: boolean) =>
      roomRef.current?.send(CARD_ROOM_EVENTS.READY, { isReady }),
    [roomRef]
  );
  const sendStart = useCallback(
    () => roomRef.current?.send(CARD_ROOM_EVENTS.START, {}),
    [roomRef]
  );
  const sendEnd = useCallback(
    () => roomRef.current?.send(CARD_ROOM_EVENTS.END, {}),
    [roomRef]
  );
  // idx-113: 웹 훅과 표면을 맞추기 위해 sendLeave 추가.
  const sendLeave = useCallback(
    () => roomRef.current?.send(CARD_ROOM_EVENTS.LEAVE, {}),
    [roomRef]
  );

  return useMemo(
    () => ({
      sendChat,
      sendEnd,
      sendLeave,
      sendNext,
      sendReady,
      sendResult,
      sendReveal,
      sendRole,
      sendStart,
    }),
    [
      sendChat,
      sendEnd,
      sendLeave,
      sendNext,
      sendReady,
      sendResult,
      sendReveal,
      sendRole,
      sendStart,
    ]
  );
}
