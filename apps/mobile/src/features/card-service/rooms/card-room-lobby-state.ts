import type { CardRoomSummaryDto } from "@yeon/api-contract/card-rooms";
import {
  useYeonQuery as useQuery,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import { cardRoomsQueryKey } from "@yeon/ui/runtime/ports/card-rooms";
import { useMemo, useState } from "react";

import { cardRoomApi } from "../../../services/card-rooms/client";
import { CARD_SERVICE_TEXT } from "../card-service-copy";
import { getCardRoomHref } from "./card-room-lobby-route";

export const CARD_ROOM_LOBBY_FILTERS = [
  { label: CARD_SERVICE_TEXT.rooms.filterAll, value: "all" },
  { label: CARD_SERVICE_TEXT.rooms.filterPublic, value: "public" },
  { label: CARD_SERVICE_TEXT.rooms.filterAvailable, value: "available" },
] as const;

export type CardRoomLobbyFilter =
  (typeof CARD_ROOM_LOBBY_FILTERS)[number]["value"];

function matchesFilter(
  room: CardRoomSummaryDto,
  selectedFilter: CardRoomLobbyFilter
) {
  return (
    selectedFilter === "all" ||
    (selectedFilter === "public" && room.visibility === "public") ||
    (selectedFilter === "available" && room.status === "waiting")
  );
}

function matchesKeyword(room: CardRoomSummaryDto, keyword: string) {
  return (
    keyword.length === 0 ||
    room.title.toLowerCase().includes(keyword) ||
    room.deckTitle.toLowerCase().includes(keyword) ||
    room.hostLabel.toLowerCase().includes(keyword)
  );
}

function filterRooms(
  rooms: CardRoomSummaryDto[],
  selectedFilter: CardRoomLobbyFilter,
  searchKeyword: string
) {
  const keyword = searchKeyword.trim().toLowerCase();
  return rooms.filter(
    (room) =>
      matchesFilter(room, selectedFilter) && matchesKeyword(room, keyword)
  );
}

export function useCardRoomLobbyState() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] =
    useState<CardRoomLobbyFilter>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isCreateOpen, setCreateOpen] = useState(false);

  const roomsQuery = useQuery({
    queryFn: () => cardRoomApi.listRooms(),
    queryKey: cardRoomsQueryKey(),
  });
  const rooms = roomsQuery.data?.rooms ?? [];
  const filteredRooms = useMemo(
    () => filterRooms(rooms, selectedFilter, searchKeyword),
    [rooms, searchKeyword, selectedFilter]
  );

  function openRoom(roomId: string) {
    router.push(getCardRoomHref(roomId));
  }

  function handleRoomCreated(roomId: string) {
    setCreateOpen(false);
    openRoom(roomId);
  }

  return {
    filteredRooms,
    handleRoomCreated,
    isCreateOpen,
    openRoom,
    roomsQuery,
    searchKeyword,
    selectedFilter,
    setCreateOpen,
    setSearchKeyword,
    setSelectedFilter,
  };
}
