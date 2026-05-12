"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TypingRoomSummary } from "@yeon/race-shared";
import { loadPublicWaitingTypingRooms } from "./typing-service-fetch";
import { typingServiceQueryKeys } from "./typing-service-query-keys";
import { resolveRaceServerUrl } from "./use-race-room";

export type TypingRoomLobbyState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "empty" }
  | { kind: "ready"; rooms: TypingRoomSummary[] };

async function fetchTypingRooms() {
  const endpoint = resolveRaceServerUrl().replace(/^ws/, "http");
  return loadPublicWaitingTypingRooms(endpoint);
}

export function useTypingRoomLobby() {
  const roomsQuery = useQuery({
    queryKey: typingServiceQueryKeys.publicWaitingRooms(),
    queryFn: fetchTypingRooms,
    refetchInterval: 2500,
  });

  const state = useMemo<TypingRoomLobbyState>(() => {
    if (roomsQuery.isPending) return { kind: "loading" };
    if (roomsQuery.isError)
      return { kind: "error", message: "타자방 서버에 연결할 수 없어요." };
    return roomsQuery.data.length > 0
      ? { kind: "ready", rooms: roomsQuery.data }
      : { kind: "empty" };
  }, [roomsQuery.data, roomsQuery.isError, roomsQuery.isPending]);

  const refresh = useCallback(() => {
    void roomsQuery.refetch();
  }, [roomsQuery]);

  return useMemo(() => ({ state, refresh }), [state, refresh]);
}
