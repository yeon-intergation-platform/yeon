"use client";

import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { CommonProductHeader } from "@/components/product-shell/product-header";
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
    <div className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="card" />
      <main>
        <section className={ROOM_LOBBY_CLASS.heroSection}>
          <div>
            <h1 className={ROOM_LOBBY_CLASS.heroTitle}>카드방</h1>
            <p className={ROOM_LOBBY_CLASS.heroDescription}>
              저장된 실제 덱 스냅샷으로 카드방을 만들고, 실시간으로 답변을
              확인합니다.
            </p>
          </div>
          <RoomCharacterSummaryCard
            loaded={profileLoaded}
            nickname={profile.nickname}
            characterId={profile.characterId}
            locale={settings.locale}
            changeHref="/card-service"
          />
        </section>

        <section className={ROOM_LOBBY_CLASS.listTopBorder}>
          <div className={ROOM_LOBBY_CLASS.filterRow}>
            <div className={ROOM_LOBBY_CLASS.filterScroller}>
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  data-active={selectedFilter === filter.value}
                  className="h-[50px] shrink-0 rounded-full border border-[#d9d9d9] bg-white px-7 text-[16px] font-semibold text-[#111] transition-colors hover:border-[#111] data-[active=true]:border-[#050505] data-[active=true]:bg-[#050505] data-[active=true]:text-white"
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className={ROOM_LOBBY_CLASS.inputButtonRow}>
              <label className={ROOM_LOBBY_CLASS.searchField}>
                <Search
                  aria-hidden="true"
                  size={22}
                  className={ROOM_LOBBY_CLASS.searchIcon}
                />
                <input
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="방 검색"
                  className="h-[50px] w-full rounded-lg border border-[#d7d7d7] bg-white pl-12 pr-4 text-[16px] font-medium text-[#111] outline-none placeholder:text-[#aaa] focus:border-[#111]"
                />
              </label>
              {!isEmptyState ? (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex h-[50px] items-center justify-center rounded-lg bg-[#111] px-8 text-[16px] font-bold text-white no-underline transition-opacity hover:opacity-90"
                >
                  카드방 만들기
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-[#d9d9d9] bg-white">
            {roomsQuery.isLoading ? (
              <div className="flex min-h-[280px] items-center justify-center text-[16px] font-bold text-[#666]">
                실제 카드방 목록을 불러오는 중...
              </div>
            ) : roomsQuery.isError ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-16 text-center">
                <h2 className="text-[28px] font-black tracking-[-0.05em]">
                  목록을 불러오지 못했어요
                </h2>
                <p className="mt-3 text-[#666]">
                  카드방 서버 상태를 확인해 주세요.
                </p>
              </div>
            ) : isEmptyState ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <h2 className="break-keep text-[32px] font-black tracking-[-0.05em] text-[#111]">
                  열린 카드방이 없어요
                </h2>
                <p className="mt-3 max-w-[300px] break-keep text-[16px] font-medium leading-6 text-[#666]">
                  내 덱 또는 게스트 덱 스냅샷으로 첫 카드방을 만들어 보세요.
                </p>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mx-auto mt-8 rounded-lg bg-[#050505] px-8 py-4 text-[17px] font-bold text-white no-underline transition-colors hover:bg-[#222]"
                >
                  카드방 만들기
                </button>
              </div>
            ) : (
              <div className={ROOM_LOBBY_CLASS.roomListRow}>
                {filteredRooms.map((room) => (
                  <Link
                    key={room.id}
                    href={`/card-service/rooms/${room.id}`}
                    className="group grid gap-5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 no-underline transition-colors hover:border-[#111] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111] md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <div className={SHARED_FEATURE_CLASS.wrapItemsCenterGap2}>
                        <span className="rounded-full border border-[#d9ead3] bg-[#eef8ea] px-2.5 py-1 text-[11px] font-bold text-[#2f7d32]">
                          {room.status === "waiting"
                            ? "대기중"
                            : room.status === "finished"
                              ? "완료"
                              : "학습중"}
                        </span>
                        <span className="rounded-full border border-[#e5e5e5] bg-white px-2.5 py-1 text-[11px] font-bold text-[#111]">
                          {room.cardCount}장
                        </span>
                      </div>
                      <h2 className={ROOM_LOBBY_CLASS.roomMetaRow}>
                        {room.title}
                      </h2>
                      <p
                        className={`mt-2 ${SHARED_FEATURE_CLASS.text13MediumSecondary}`}
                      >
                        {room.deckTitle} · 방장 {room.hostLabel}
                      </p>
                    </div>
                    <div className={ROOM_LOBBY_CLASS.roomStatusArea}>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border border-[#ddd] bg-white px-3 py-1.5 ${SHARED_FEATURE_CLASS.text13PrimaryBold}`}
                      >
                        <Users size={14} /> 외우기 {room.memorizerCount} · 확인{" "}
                        {room.checkerCount}
                      </span>
                      <span className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-bold text-white transition-colors group-hover:bg-[#333]">
                        입장하기
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

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
    </div>
  );
}
