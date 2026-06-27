"use client";

import type { useCardRoomLobbyState } from "./use-card-room-lobby-state";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  getYeonButtonClassName,
  YeonBadge,
  YeonButton,
  YeonField,
  YeonIcon,
  YeonLabel,
  YeonLink,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import {
  RoomCharacterSummaryCard,
  RoomCreateDialog,
  ROOM_LOBBY_CLASS,
} from "@/features/room-shared";
import { CardRoomCreateForm } from "./card-room-create-screen";
import { CARD_ROOM_LOBBY_FILTERS } from "./use-card-room-lobby-state";

type CardRoomLobbyState = ReturnType<typeof useCardRoomLobbyState>;

type CardRoomLobbyPartProps = {
  lobby: CardRoomLobbyState;
};

function getCardRoomLobbyStatusLabel(status: string) {
  if (status === "waiting") {
    return "대기중";
  }

  if (status === "finished") {
    return "완료";
  }

  return "학습중";
}

export function CardRoomLobbyHero({ lobby }: CardRoomLobbyPartProps) {
  return (
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
        loaded={lobby.profileLoaded}
        nickname={lobby.profile.nickname}
        characterId={lobby.profile.characterId}
        locale={lobby.locale}
        changeHref={resolveYeonWebPath("cardHome")}
      />
    </YeonView>
  );
}

export function CardRoomLobbyRoomSection({ lobby }: CardRoomLobbyPartProps) {
  return (
    <YeonView as="section" className={ROOM_LOBBY_CLASS.listTopBorder}>
      <CardRoomLobbyFilterBar lobby={lobby} />
      <CardRoomLobbyListSurface lobby={lobby} />
    </YeonView>
  );
}

function CardRoomLobbyFilterBar({ lobby }: CardRoomLobbyPartProps) {
  return (
    <YeonView className={ROOM_LOBBY_CLASS.filterRow}>
      <YeonView className={ROOM_LOBBY_CLASS.filterScroller}>
        {CARD_ROOM_LOBBY_FILTERS.map((filter) => (
          <YeonButton
            key={filter.value}
            type="button"
            onClick={() => lobby.setSelectedFilter(filter.value)}
            variant={
              lobby.selectedFilter === filter.value ? "pill" : "secondary"
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
            value={lobby.searchKeyword}
            onChange={(event) => lobby.setSearchKeyword(event.target.value)}
            placeholder="방 검색"
            className="h-[50px] rounded-lg pl-12 pr-4 text-[16px] font-medium"
          />
        </YeonLabel>
        {!lobby.isEmptyState ? (
          <YeonButton
            type="button"
            onClick={lobby.openCreateModal}
            variant="primary"
            size="lg"
            className="h-[50px] rounded-lg px-8 text-[16px]"
          >
            카드방 만들기
          </YeonButton>
        ) : null}
      </YeonView>
    </YeonView>
  );
}

function CardRoomLobbyListSurface({ lobby }: CardRoomLobbyPartProps) {
  return (
    <YeonSurface className="mt-7">
      {lobby.listState === "loading" ? (
        <CardRoomLobbyLoadingState />
      ) : lobby.listState === "error" ? (
        <CardRoomLobbyErrorState />
      ) : lobby.listState === "empty" ? (
        <CardRoomLobbyEmptyState onCreate={lobby.openCreateModal} />
      ) : (
        <CardRoomLobbyRoomList lobby={lobby} />
      )}
    </YeonSurface>
  );
}

function CardRoomLobbyLoadingState() {
  return (
    <YeonText
      as="p"
      variant="label"
      tone="secondary"
      className="flex min-h-[280px] items-center justify-center text-[16px]"
    >
      실제 카드방 목록을 불러오는 중...
    </YeonText>
  );
}

function CardRoomLobbyErrorState() {
  return (
    <YeonView className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="break-keep text-[22px] font-black tracking-[-0.04em] text-[#111] sm:text-[28px]"
      >
        목록을 불러오지 못했어요
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className="mt-3 max-w-[320px] break-keep leading-6 text-[#666]"
      >
        잠시 후 다시 시도해 주세요. 문제가 계속되면 잠깐 뒤에 새로고침해 보세요.
      </YeonText>
      <YeonButton
        type="button"
        onClick={() => window.location.reload()}
        variant="secondary"
        size="lg"
        className="mt-6 h-11 rounded-lg px-5 text-[14px] font-bold"
      >
        다시 시도
      </YeonButton>
    </YeonView>
  );
}

type CardRoomLobbyEmptyStateProps = {
  onCreate: () => void;
};

function CardRoomLobbyEmptyState({ onCreate }: CardRoomLobbyEmptyStateProps) {
  return (
    <YeonView className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="break-keep text-[24px] font-black tracking-[-0.04em] text-[#111] sm:text-[32px]"
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
        onClick={onCreate}
        variant="primary"
        size="xl"
        className="mx-auto mt-8 rounded-lg px-8 py-4 text-[17px]"
      >
        카드방 만들기
      </YeonButton>
    </YeonView>
  );
}

function CardRoomLobbyRoomList({ lobby }: CardRoomLobbyPartProps) {
  return (
    <YeonView className={ROOM_LOBBY_CLASS.roomListRow}>
      {lobby.filteredRooms.map((room) => (
        <YeonLink
          key={room.id}
          href={resolveYeonWebPath("cardRoomDetail", {
            roomId: room.id,
          })}
          className="group grid gap-5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 no-underline transition-colors hover:border-[#111] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111] md:grid-cols-[1fr_auto]"
        >
          <YeonView>
            <YeonView className={SHARED_FEATURE_CLASS.wrapItemsCenterGap2}>
              <YeonBadge variant="neutral" className="text-[11px]">
                {getCardRoomLobbyStatusLabel(room.status)}
              </YeonBadge>
              <YeonBadge variant="neutral" className="text-[11px] text-[#111]">
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
              <YeonIcon name="users" size={14} /> 외우기 {room.memorizerCount} ·
              확인 {room.checkerCount}
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
  );
}

export function CardRoomLobbyCreateDialog({ lobby }: CardRoomLobbyPartProps) {
  return (
    <RoomCreateDialog
      open={lobby.isCreateModalOpen}
      titleId="create-card-room-title"
      title="카드방 만들기"
      description="현재 덱 내용을 고정해 함께 확인할 카드방을 만듭니다."
      closeLabel="카드방 만들기 닫기"
      onClose={lobby.closeCreateModal}
    >
      <CardRoomCreateForm
        onCancel={lobby.closeCreateModal}
        submitLabel="카드방 만들고 입장하기"
      />
    </RoomCreateDialog>
  );
}
