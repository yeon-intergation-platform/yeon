import type { CardRoomSummaryDto } from "@yeon/api-contract/card-rooms";
import {
  YeonButton,
  YeonFormStack as FormStack,
  YeonStateBlock as StateBlock,
  YeonText,
  YeonTextField as TextField,
  YeonView,
} from "@yeon/ui/native";

import { CARD_SERVICE_TEXT } from "../card-service-copy";
import {
  CARD_ROOM_LOBBY_FILTERS,
  type CardRoomLobbyFilter,
} from "./card-room-lobby-state";
import { cardRoomLobbyStyles as styles } from "./card-room-lobby-styles";

function statusLabel(status: CardRoomSummaryDto["status"]) {
  if (status === "waiting") return CARD_SERVICE_TEXT.rooms.statusWaiting;
  if (status === "finished" || status === "closed") {
    return CARD_SERVICE_TEXT.rooms.statusFinished;
  }
  return CARD_SERVICE_TEXT.rooms.statusStudying;
}

type RoomCardProps = {
  room: CardRoomSummaryDto;
  onOpen: () => void;
};

function RoomCard({ room, onOpen }: RoomCardProps) {
  return (
    <YeonButton
      accessibilityRole="button"
      aria-label={`${CARD_SERVICE_TEXT.rooms.joinLabel}: ${room.title}`}
      onPress={onOpen}
      style={styles.roomCard}
    >
      <YeonView style={styles.roomBadges}>
        <YeonText style={styles.badge}>{statusLabel(room.status)}</YeonText>
        <YeonText style={styles.badge}>
          {CARD_SERVICE_TEXT.rooms.cardCount(room.cardCount)}
        </YeonText>
      </YeonView>
      <YeonText numberOfLines={1} style={styles.roomTitle}>
        {room.title}
      </YeonText>
      <YeonText numberOfLines={1} style={styles.roomMeta}>
        {room.deckTitle} · 방장 {room.hostLabel}
      </YeonText>
      <YeonView style={styles.roomFooter}>
        <YeonText style={styles.roomRoles}>
          {CARD_SERVICE_TEXT.rooms.roleSummary(
            room.memorizerCount,
            room.checkerCount
          )}
        </YeonText>
        <YeonText style={styles.roomJoin}>
          {CARD_SERVICE_TEXT.rooms.joinLabel}
        </YeonText>
      </YeonView>
    </YeonButton>
  );
}

export function CardRoomLobbyHeader() {
  return (
    <YeonView style={styles.header}>
      <YeonText style={styles.title}>
        {CARD_SERVICE_TEXT.rooms.lobbyTitle}
      </YeonText>
      <YeonText style={styles.subtitle}>
        {CARD_SERVICE_TEXT.rooms.lobbySubtitle}
      </YeonText>
    </YeonView>
  );
}

type CardRoomLobbyFiltersProps = {
  selectedFilter: CardRoomLobbyFilter;
  onSelectFilter: (filter: CardRoomLobbyFilter) => void;
};

export function CardRoomLobbyFilters({
  selectedFilter,
  onSelectFilter,
}: CardRoomLobbyFiltersProps) {
  return (
    <YeonView style={styles.filterRow}>
      {CARD_ROOM_LOBBY_FILTERS.map((filter) => {
        const active = selectedFilter === filter.value;
        return (
          <YeonButton
            accessibilityRole="button"
            aria-label={filter.label}
            key={filter.value}
            onPress={() => onSelectFilter(filter.value)}
            style={[styles.filterChip, active && styles.filterChipActive]}
          >
            <YeonText
              style={[
                styles.filterChipText,
                active && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </YeonText>
          </YeonButton>
        );
      })}
    </YeonView>
  );
}

type CardRoomLobbySearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function CardRoomLobbySearchField({
  value,
  onChangeText,
}: CardRoomLobbySearchFieldProps) {
  return (
    <TextField
      label=""
      onChangeText={onChangeText}
      placeholder={CARD_SERVICE_TEXT.rooms.searchPlaceholder}
      value={value}
    />
  );
}

type CardRoomLobbyListProps = {
  isError: boolean;
  isPending: boolean;
  rooms: CardRoomSummaryDto[];
  onOpenRoom: (roomId: string) => void;
};

export function CardRoomLobbyList({
  isError,
  isPending,
  rooms,
  onOpenRoom,
}: CardRoomLobbyListProps) {
  if (isPending) {
    return (
      <StateBlock
        loading
        message={CARD_SERVICE_TEXT.rooms.loadingMessage}
        title={CARD_SERVICE_TEXT.rooms.loadingTitle}
      />
    );
  }

  if (isError) {
    return (
      <StateBlock
        message={CARD_SERVICE_TEXT.rooms.errorMessage}
        title={CARD_SERVICE_TEXT.rooms.errorTitle}
      />
    );
  }

  if (rooms.length === 0) {
    return (
      <StateBlock
        message={CARD_SERVICE_TEXT.rooms.emptyMessage}
        title={CARD_SERVICE_TEXT.rooms.emptyTitle}
      />
    );
  }

  return (
    <FormStack>
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          onOpen={() => onOpenRoom(room.id)}
          room={room}
        />
      ))}
    </FormStack>
  );
}
