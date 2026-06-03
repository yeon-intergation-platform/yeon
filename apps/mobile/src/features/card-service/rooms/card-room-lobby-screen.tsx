import type { CardRoomSummaryDto } from "@yeon/api-contract/card-rooms";
import {
  type YeonHref as Href,
  useYeonQuery as useQuery,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import {
  YeonActionButton as ActionButton,
  YeonButton,
  YeonFormStack as FormStack,
  YeonMobileScreen as MobileScreen,
  YeonStateBlock as StateBlock,
  YeonText,
  YeonTextField as TextField,
  YeonView,
  createYeonStyleSheet,
  yeonMobileAppColors,
} from "@yeon/ui/native";
import { cardRoomsQueryKey } from "@yeon/ui/runtime/ports/card-rooms";
import { YEON_ROUTE_TEMPLATES } from "@yeon/ui/runtime/ports";
import { useMemo, useState } from "react";
import { cardRoomApi } from "../../../services/card-rooms/client";
import { CARD_SERVICE_TEXT } from "../card-service-copy";
import { CardRoomCreateSheet } from "./card-room-create-sheet";

const FILTERS = [
  { label: CARD_SERVICE_TEXT.rooms.filterAll, value: "all" },
  { label: CARD_SERVICE_TEXT.rooms.filterPublic, value: "public" },
  { label: CARD_SERVICE_TEXT.rooms.filterAvailable, value: "available" },
] as const;

type LobbyFilter = (typeof FILTERS)[number]["value"];

function getCardRoomHref(roomId: string): Href {
  return {
    pathname: YEON_ROUTE_TEMPLATES.cardRoomDetail,
    params: { roomId },
  } as Href;
}

function statusLabel(status: CardRoomSummaryDto["status"]) {
  if (status === "waiting") return CARD_SERVICE_TEXT.rooms.statusWaiting;
  if (status === "finished" || status === "closed")
    return CARD_SERVICE_TEXT.rooms.statusFinished;
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

export function CardRoomLobbyScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<LobbyFilter>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isCreateOpen, setCreateOpen] = useState(false);

  const roomsQuery = useQuery({
    queryFn: () => cardRoomApi.listRooms(),
    queryKey: cardRoomsQueryKey(),
  });

  const rooms = roomsQuery.data?.rooms ?? [];

  const filteredRooms = useMemo(() => {
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
  }, [rooms, searchKeyword, selectedFilter]);

  return (
    <MobileScreen contentVariant="card" safeAreaEdges={["top"]}>
      <FormStack gap="roomy">
        <YeonView style={styles.header}>
          <YeonText style={styles.title}>
            {CARD_SERVICE_TEXT.rooms.lobbyTitle}
          </YeonText>
          <YeonText style={styles.subtitle}>
            {CARD_SERVICE_TEXT.rooms.lobbySubtitle}
          </YeonText>
        </YeonView>

        <YeonView style={styles.filterRow}>
          {FILTERS.map((filter) => {
            const active = selectedFilter === filter.value;
            return (
              <YeonButton
                accessibilityRole="button"
                aria-label={filter.label}
                key={filter.value}
                onPress={() => setSelectedFilter(filter.value)}
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

        <TextField
          label=""
          onChangeText={setSearchKeyword}
          placeholder={CARD_SERVICE_TEXT.rooms.searchPlaceholder}
          value={searchKeyword}
        />

        <ActionButton
          label={CARD_SERVICE_TEXT.rooms.createLabel}
          onPress={() => setCreateOpen(true)}
          variant="dark"
        />

        {roomsQuery.isPending ? (
          <StateBlock
            loading
            message={CARD_SERVICE_TEXT.rooms.loadingMessage}
            title={CARD_SERVICE_TEXT.rooms.loadingTitle}
          />
        ) : roomsQuery.isError ? (
          <StateBlock
            message={CARD_SERVICE_TEXT.rooms.errorMessage}
            title={CARD_SERVICE_TEXT.rooms.errorTitle}
          />
        ) : filteredRooms.length === 0 ? (
          <StateBlock
            message={CARD_SERVICE_TEXT.rooms.emptyMessage}
            title={CARD_SERVICE_TEXT.rooms.emptyTitle}
          />
        ) : (
          <FormStack>
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                onOpen={() => router.push(getCardRoomHref(room.id))}
                room={room}
              />
            ))}
          </FormStack>
        )}
      </FormStack>

      <CardRoomCreateSheet
        onClose={() => setCreateOpen(false)}
        onCreated={(roomId) => {
          setCreateOpen(false);
          router.push(getCardRoomHref(roomId));
        }}
        visible={isCreateOpen}
      />
    </MobileScreen>
  );
}

const styles = createYeonStyleSheet({
  header: {
    gap: 6,
    marginTop: 28,
    paddingTop: 4,
  },
  title: {
    color: yeonMobileAppColors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  filterChipActive: {
    backgroundColor: yeonMobileAppColors.text,
    borderColor: yeonMobileAppColors.text,
  },
  filterChipText: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: yeonMobileAppColors.surfaceStrong,
  },
  roomCard: {
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  roomBadges: {
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: yeonMobileAppColors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roomTitle: {
    color: yeonMobileAppColors.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  roomMeta: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
  },
  roomFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  roomRoles: {
    color: yeonMobileAppColors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  roomJoin: {
    backgroundColor: yeonMobileAppColors.text,
    borderRadius: 10,
    color: yeonMobileAppColors.surfaceStrong,
    fontSize: 13,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
