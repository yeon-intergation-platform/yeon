import { useMemo } from "react";

import { useCardRoomConnectionActions } from "./use-card-room-connection-actions";
import { useCardRoomRealtimeSession } from "./use-card-room-realtime-session";

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
  const { connectionState, error, roomRef, state } = useCardRoomRealtimeSession(
    {
      participantId,
      participantToken,
      roomId,
    }
  );
  const actions = useCardRoomConnectionActions(roomRef);

  return useMemo(
    () => ({
      state,
      connectionState,
      error,
      ...actions,
    }),
    [state, connectionState, error, actions]
  );
}
