import {
  CARD_ROOM_LOBBY_FILTER,
  filterCardRoomLobbyRooms,
  type CardRoomLobbyFilter,
} from "@yeon/race-shared";
import {
  useYeonQuery as useQuery,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import { cardRoomsQueryKey } from "@yeon/ui/runtime/ports/card-rooms";
import { useMemo, useState } from "react";

import { cardRoomApi } from "../../../services/card-rooms/client";
import { CARD_SERVICE_TEXT } from "../card-service-copy";
import { getCardRoomHref } from "./card-room-lobby-route";

export type { CardRoomLobbyFilter } from "@yeon/race-shared";

export const CARD_ROOM_LOBBY_FILTERS = [
  {
    label: CARD_SERVICE_TEXT.rooms.filterAll,
    value: CARD_ROOM_LOBBY_FILTER.ALL,
  },
  {
    label: CARD_SERVICE_TEXT.rooms.filterPublic,
    value: CARD_ROOM_LOBBY_FILTER.PUBLIC,
  },
  {
    label: CARD_SERVICE_TEXT.rooms.filterAvailable,
    value: CARD_ROOM_LOBBY_FILTER.AVAILABLE,
  },
] as const;

export function useCardRoomLobbyState() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<CardRoomLobbyFilter>(
    CARD_ROOM_LOBBY_FILTER.ALL
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isCreateOpen, setCreateOpen] = useState(false);

  const roomsQuery = useQuery({
    queryFn: () => cardRoomApi.listRooms(),
    queryKey: cardRoomsQueryKey(),
  });
  const rooms = roomsQuery.data?.rooms ?? [];
  const filteredRooms = useMemo(
    () => filterCardRoomLobbyRooms(rooms, selectedFilter, searchKeyword),
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
