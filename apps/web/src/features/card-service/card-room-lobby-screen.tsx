"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { useCallback, useMemo, useState } from "react";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import {
  getYeonButtonClassName,
  YeonBadge,
  YeonButton,
  YeonField,
  YeonIcon,
  YeonSurface,
  YeonText,
  YeonLabel,
  YeonView,
  YeonLink,
} from "@yeon/ui";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import { useTypingSettings } from "@/features/typing-service/use-typing-settings";
import {
  RoomCharacterSummaryCard,
  RoomCreateDialog,
  ROOM_LOBBY_CLASS,
} from "@/features/room-shared";
import { CardRoomCreateForm } from "./card-room-create-screen";
import { useCardRoomList, useCardRoomProfile } from "./hooks";

const FILTERS = [
  { label: "전체", value: "all" },
  { label: "공개방", value: "public" },
  { label: "입장 가능", value: "available" },
] as const;

type LobbyFilter = (typeof FILTERS)[number]["value"];

export function CardRoomLobbyScreen() {
  const [selectedFilter, setSelectedFilter] = useState<LobbyFilter>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const { profile, loaded: profileLoaded } = useCardRoomProfile();
  const { settings } = useTypingSettings();
  const roomsQuery = useCardRoomList();
  const rooms = roomsQuery.data ?? [];

  const openCreateModal = useCallback(() => {
    setCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
  }, []);

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

  const isEmptyState =
    !roomsQuery.isLoading &&
    !roomsQuery.isError &&
    filteredRooms[0] === undefined;

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="card" />
      <YeonView as="main">
        <YeonView as="section" className={ROOM_LOBBY_CLASS.heroSection}>
          <YeonView>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className={ROOM_LOBBY_CLASS.heroTitle}
            >
              카드방
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={ROOM_LOBBY_CLASS.heroDescription}
            >
              저장된 실제 덱 스냅샷으로 카드방을 만들고, 실시간으로 답변을
              확인합니다.
            </YeonText>
          </YeonView>
          <RoomCharacterSummaryCard
            loaded={profileLoaded}
            nickname={profile.nickname}
            characterId={profile.characterId}
            locale={settings.locale}
            changeHref={resolveYeonWebPath("cardHome")}
          />
        </YeonView>

        <YeonView as="section" className={ROOM_LOBBY_CLASS.listTopBorder}>
          <YeonView className={ROOM_LOBBY_CLASS.filterRow}>
            <YeonView className={ROOM_LOBBY_CLASS.filterScroller}>
              {FILTERS.map((filter) => (
                <YeonButton
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  variant={
                    selectedFilter === filter.value ? "pill" : "secondary"
                  }
                  size="lg"
                  className="h-[50px] shrink-0 rounded-full px-7 text-[16px]"
                >
                  {filter.label}
                </YeonButton>
              ))}
            </YeonView>
            <YeonView className={ROOM_LOBBY_CLASS.inputButtonRow}>
              <YeonLabel className={ROOM_LOBBY_CLASS.searchField}>
                <YeonIcon
                  name="search"
                  size={22}
                  className={ROOM_LOBBY_CLASS.searchIcon}
                />
                <YeonField
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="방 검색"
                  className="h-[50px] rounded-lg pl-12 pr-4 text-[16px] font-medium"
                />
              </YeonLabel>
              {!isEmptyState ? (
                <YeonButton
                  type="button"
                  onClick={openCreateModal}
                  variant="primary"
                  size="lg"
                  className="h-[50px] rounded-lg px-8 text-[16px]"
                >
                  카드방 만들기
                </YeonButton>
              ) : null}
            </YeonView>
          </YeonView>

          <YeonSurface className="mt-7">
            {roomsQuery.isLoading ? (
              <YeonText
                as="p"
                variant="label"
                tone="secondary"
                className="flex min-h-[280px] items-center justify-center text-[16px]"
              >
                실제 카드방 목록을 불러오는 중...
              </YeonText>
            ) : roomsQuery.isError ? (
              <YeonView className="flex min-h-[280px] flex-col items-center justify-center px-6 py-16 text-center">
                <YeonText
                  as="h2"
                  variant="unstyled"
                  tone="inherit"
                  className="text-[28px] font-black tracking-[-0.05em]"
                >
                  목록을 불러오지 못했어요
                </YeonText>
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className="mt-3 text-[#666]"
                >
                  카드방 서버 상태를 확인해 주세요.
                </YeonText>
              </YeonView>
            ) : isEmptyState ? (
              <YeonView className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <YeonText
                  as="h2"
                  variant="unstyled"
                  tone="inherit"
                  className="break-keep text-[32px] font-black tracking-[-0.05em] text-[#111]"
                >
                  열린 카드방이 없어요
                </YeonText>
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className="mt-3 max-w-[300px] break-keep text-[16px] font-medium leading-6 text-[#666]"
                >
                  내 덱 또는 게스트 덱 스냅샷으로 첫 카드방을 만들어 보세요.
                </YeonText>
                <YeonButton
                  type="button"
                  onClick={openCreateModal}
                  variant="primary"
                  size="xl"
                  className="mx-auto mt-8 rounded-lg px-8 py-4 text-[17px]"
                >
                  카드방 만들기
                </YeonButton>
              </YeonView>
            ) : (
              <YeonView className={ROOM_LOBBY_CLASS.roomListRow}>
                {filteredRooms.map((room) => (
                  <YeonLink
                    key={room.id}
                    href={resolveYeonWebPath("cardRoomDetail", {
                      roomId: room.id,
                    })}
                    className="group grid gap-5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 no-underline transition-colors hover:border-[#111] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111] md:grid-cols-[1fr_auto]"
                  >
                    <YeonView>
                      <YeonView
                        className={SHARED_FEATURE_CLASS.wrapItemsCenterGap2}
                      >
                        <YeonBadge variant="neutral" className="text-[11px]">
                          {room.status === "waiting"
                            ? "대기중"
                            : room.status === "finished"
                              ? "완료"
                              : "학습중"}
                        </YeonBadge>
                        <YeonBadge
                          variant="neutral"
                          className="text-[11px] text-[#111]"
                        >
                          {room.cardCount}장
                        </YeonBadge>
                      </YeonView>
                      <YeonText
                        as="h2"
                        variant="unstyled"
                        tone="inherit"
                        className={ROOM_LOBBY_CLASS.roomMetaRow}
                      >
                        {room.title}
                      </YeonText>
                      <YeonText
                        as="p"
                        variant="unstyled"
                        tone="inherit"
                        className={`mt-2 ${SHARED_FEATURE_CLASS.text13MediumSecondary}`}
                      >
                        {room.deckTitle} · 방장 {room.hostLabel}
                      </YeonText>
                    </YeonView>
                    <YeonView className={ROOM_LOBBY_CLASS.roomStatusArea}>
                      <YeonText
                        as="span"
                        variant="unstyled"
                        tone="inherit"
                        className={`inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 ${SHARED_FEATURE_CLASS.text13PrimaryBold}`}
                      >
                        <YeonIcon name="users" size={14} /> 외우기{" "}
                        {room.memorizerCount} · 확인 {room.checkerCount}
                      </YeonText>
                      <YeonText
                        as="span"
                        variant="unstyled"
                        tone="inherit"
                        className={getYeonButtonClassName({
                          variant: "primary",
                          size: "sm",
                          className: "rounded-xl px-4 py-2 text-[13px]",
                        })}
                      >
                        입장하기
                      </YeonText>
                    </YeonView>
                  </YeonLink>
                ))}
              </YeonView>
            )}
          </YeonSurface>
        </YeonView>
      </YeonView>

      <RoomCreateDialog
        open={isCreateModalOpen}
        titleId="create-card-room-title"
        title="카드방 만들기"
        description="현재 덱 내용을 고정해 함께 확인할 카드방을 만듭니다."
        closeLabel="카드방 만들기 닫기"
        onClose={closeCreateModal}
      >
        <CardRoomCreateForm
          onCancel={closeCreateModal}
          submitLabel="카드방 만들고 입장하기"
        />
      </RoomCreateDialog>
    </YeonView>
  );
}
