import {
  YeonActionButton as ActionButton,
  YeonFormStack as FormStack,
  YeonMobileScreen as MobileScreen,
} from "@yeon/ui/native";

import { CARD_SERVICE_TEXT } from "../card-service-copy";
import { CardRoomCreateSheet } from "./card-room-create-sheet";
import {
  CardRoomLobbyFilters,
  CardRoomLobbyHeader,
  CardRoomLobbyList,
  CardRoomLobbySearchField,
} from "./card-room-lobby-sections";
import { useCardRoomLobbyState } from "./card-room-lobby-state";

export function CardRoomLobbyScreen() {
  const lobby = useCardRoomLobbyState();

  return (
    <MobileScreen contentVariant="card" safeAreaEdges={["top"]}>
      <FormStack gap="roomy">
        <CardRoomLobbyHeader />
        <CardRoomLobbyFilters
          onSelectFilter={lobby.setSelectedFilter}
          selectedFilter={lobby.selectedFilter}
        />
        <CardRoomLobbySearchField
          onChangeText={lobby.setSearchKeyword}
          value={lobby.searchKeyword}
        />
        <ActionButton
          label={CARD_SERVICE_TEXT.rooms.createLabel}
          onPress={() => lobby.setCreateOpen(true)}
          variant="dark"
        />
        <CardRoomLobbyList
          isError={lobby.roomsQuery.isError}
          isPending={lobby.roomsQuery.isPending}
          onOpenRoom={lobby.openRoom}
          rooms={lobby.filteredRooms}
        />
      </FormStack>

      <CardRoomCreateSheet
        onClose={() => lobby.setCreateOpen(false)}
        onCreated={lobby.handleRoomCreated}
        visible={lobby.isCreateOpen}
      />
    </MobileScreen>
  );
}
