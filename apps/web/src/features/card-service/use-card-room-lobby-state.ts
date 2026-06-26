"use client";

import { useCallback, useMemo, useState } from "react";
import type { CardRoomSummaryDto } from "@yeon/api-contract/card-rooms";
import {
  CARD_ROOM_LOBBY_FILTER,
  filterCardRoomLobbyRooms,
  type CardRoomLobbyFilter,
} from "@yeon/race-shared";
import { useTypingSettings } from "@/features/typing-service/use-typing-settings";
import { useCardRoomList, useCardRoomProfile } from "./hooks";

export const CARD_ROOM_LOBBY_FILTERS = [
  { label: "전체", value: CARD_ROOM_LOBBY_FILTER.ALL },
  { label: "공개방", value: CARD_ROOM_LOBBY_FILTER.PUBLIC },
  { label: "입장 가능", value: CARD_ROOM_LOBBY_FILTER.AVAILABLE },
] as const;

const EMPTY_CARD_ROOMS: CardRoomSummaryDto[] = [];

type CardRoomLobbyListState = "loading" | "error" | "empty" | "ready";

function deriveCardRoomLobbyListState(
  isLoading: boolean,
  isError: boolean,
  rooms: CardRoomSummaryDto[]
): CardRoomLobbyListState {
  if (isLoading) {
    return "loading";
  }

  if (isError) {
    return "error";
  }

  return rooms[0] === undefined ? "empty" : "ready";
}

export function useCardRoomLobbyState() {
  const [selectedFilter, setSelectedFilter] = useState<CardRoomLobbyFilter>(
    CARD_ROOM_LOBBY_FILTER.ALL
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const { profile, loaded: profileLoaded } = useCardRoomProfile();
  const { settings } = useTypingSettings();
  const roomsQuery = useCardRoomList();
  const rooms = roomsQuery.data ? roomsQuery.data : EMPTY_CARD_ROOMS;

  const openCreateModal = useCallback(() => {
    setCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
  }, []);

  const filteredRooms = useMemo(
    () => filterCardRoomLobbyRooms(rooms, selectedFilter, searchKeyword),
    [rooms, searchKeyword, selectedFilter]
  );

  const listState = deriveCardRoomLobbyListState(
    roomsQuery.isLoading,
    roomsQuery.isError,
    filteredRooms
  );
  const isEmptyState = listState === "empty";

  return {
    selectedFilter,
    setSelectedFilter,
    searchKeyword,
    setSearchKeyword,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    profile,
    profileLoaded,
    locale: settings.locale,
    filteredRooms,
    listState,
    isEmptyState,
  };
}
