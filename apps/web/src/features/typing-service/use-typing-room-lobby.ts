"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TYPING_RACE_ROOM_NAME,
  TYPING_ROOM_STATUS,
  TYPING_ROOM_VISIBILITY,
  type TypingRoomSummary,
} from "@yeon/race-shared";
import { resolveRaceServerUrl } from "./use-race-room";

const typingRoomLobbyQueryKeys = {
  publicWaitingRooms: () =>
    ["typing-service", "room-lobby", "public-waiting"] as const,
};

type AvailableTypingRoom = {
  roomId: string;
  clients: number;
  maxClients: number;
  metadata?: TypingRoomSummary;
};

export type TypingRoomLobbyState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "empty" }
  | { kind: "ready"; rooms: TypingRoomSummary[] };

function toSummary(room: AvailableTypingRoom): TypingRoomSummary | null {
  if (!room.metadata) return null;
  return {
    ...room.metadata,
    roomId: room.roomId,
    currentParticipants: room.clients,
    maxParticipants: room.maxClients,
  };
}

async function fetchTypingRooms() {
  const endpoint = resolveRaceServerUrl().replace(/^ws/, "http");
  const response = await fetch(`${endpoint}/rooms/${TYPING_RACE_ROOM_NAME}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const availableRooms = (await response.json()) as AvailableTypingRoom[];
  return availableRooms
    .map(toSummary)
    .filter((room): room is TypingRoomSummary => Boolean(room))
    .filter((room) => room.status === TYPING_ROOM_STATUS.WAITING)
    .filter((room) => room.visibility === TYPING_ROOM_VISIBILITY.PUBLIC)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function useTypingRoomLobby() {
  const roomsQuery = useQuery({
    queryKey: typingRoomLobbyQueryKeys.publicWaitingRooms(),
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
