"use client";

import { useCallback, useMemo, useState } from "react";
import type { CardRoomSummaryDto } from "@yeon/api-contract/card-rooms";
import { useTypingSettings } from "@/features/typing-service/use-typing-settings";
import { useCardRoomList, useCardRoomProfile } from "./hooks";

export const CARD_ROOM_LOBBY_FILTERS = [
  { label: "전체", value: "all" },
  { label: "공개방", value: "public" },
  { label: "입장 가능", value: "available" },
] as const;

export type CardRoomLobbyFilter =
  (typeof CARD_ROOM_LOBBY_FILTERS)[number]["value"];

const EMPTY_CARD_ROOMS: CardRoomSummaryDto[] = [];

type CardRoomLobbyListState = "loading" | "error" | "empty" | "ready";

function filterCardRoomLobbyRooms(
  rooms: CardRoomSummaryDto[],
  selectedFilter: CardRoomLobbyFilter,
  searchKeyword: string
) {
  const keyword = searchKeyword.trim().toLowerCase();
  return rooms.filter((room) => {
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "public" && room.visibility === "public") ||
      (selectedFilter === "available" && room.status === "waiting");
    const matchesSearch =
      keyword.length === 0 ||
      room.title.toLowerCase().includes(keyword) ||
      room.deckTitle.toLowerCase().includes(keyword) ||
      room.hostLabel.toLowerCase().includes(keyword);
    return matchesFilter && matchesSearch;
  });
}

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
  const [selectedFilter, setSelectedFilter] =
    useState<CardRoomLobbyFilter>("all");
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
