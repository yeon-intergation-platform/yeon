"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useYeonQuery as useQuery } from "@yeon/ui/runtime/YeonQuery";
import type { TypingRoomSummary } from "@yeon/race-shared";
import { typingServiceQueryKeys } from "./typing-service-query-keys";
import { loadTypingRoomLobbyRooms } from "./typing-room-lobby-client";

export type TypingRoomLobbyState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "empty" }
  | { kind: "ready"; rooms: TypingRoomSummary[] };

const TYPING_ROOM_LOBBY_CONNECTION_ERROR_MESSAGE =
  "타자방 서버에 연결할 수 없어요.";
const TYPING_ROOM_LOBBY_ERROR_DISPLAY_FAILURE_COUNT = 2;

export function useTypingRoomLobby() {
  const roomsQuery = useQuery({
    queryKey: typingServiceQueryKeys.publicWaitingRooms(),
    queryFn: loadTypingRoomLobbyRooms,
    refetchInterval: 2500,
    refetchIntervalInBackground: false,
  });
  const [hasConnectionFailure, setHasConnectionFailure] = useState(false);

  useEffect(() => {
    if (roomsQuery.isSuccess) {
      setHasConnectionFailure(false);
      return;
    }

    if (
      roomsQuery.isError ||
      roomsQuery.failureCount >= TYPING_ROOM_LOBBY_ERROR_DISPLAY_FAILURE_COUNT
    ) {
      setHasConnectionFailure(true);
    }
  }, [roomsQuery.failureCount, roomsQuery.isError, roomsQuery.isSuccess]);

  const state = useMemo<TypingRoomLobbyState>(() => {
    const rooms = roomsQuery.data;
    if (rooms && rooms.length > 0) return { kind: "ready", rooms };

    if (hasConnectionFailure) {
      return {
        kind: "error",
        message: TYPING_ROOM_LOBBY_CONNECTION_ERROR_MESSAGE,
      };
    }

    if (roomsQuery.isPending) return { kind: "loading" };
    return { kind: "empty" };
  }, [hasConnectionFailure, roomsQuery.data, roomsQuery.isPending]);

  const refresh = useCallback(() => {
    void roomsQuery.refetch();
  }, [roomsQuery]);

  return useMemo(() => ({ state, refresh }), [state, refresh]);
}
