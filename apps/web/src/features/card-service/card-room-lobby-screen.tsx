"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Users, X } from "lucide-react";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { CharacterSprite } from "@/features/typing-service/character-sprite";
import { findCharacter } from "@/features/typing-service/characters";
import { useCharacterFrameOverrides } from "@/features/typing-service/use-character-frame-overrides";
import { useTypingSettings } from "@/features/typing-service/use-typing-settings";
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
  const frameOverrides = useCharacterFrameOverrides();
  const character = findCharacter(profile.characterId);
  const roomsQuery = useCardRoomList();
  const rooms = roomsQuery.data ?? [];

  const openCreateModal = useCallback(() => {
    setCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
  }, []);

  useEffect(() => {
    if (!isCreateModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeCreateModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeCreateModal, isCreateModalOpen]);

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
    <div className="min-h-screen bg-white text-[#111]">
      <CommonProductHeader activeService="card" />
      <main>
        <section className="flex min-h-[174px] flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <h1 className="text-[48px] font-black leading-none tracking-[-0.06em] text-[#111] md:text-[56px]">
              카드방
            </h1>
            <p className="mt-5 text-[18px] font-medium leading-7 text-[#666]">
              Spring에 저장된 실제 덱 스냅샷으로 카드방을 만들고, 실시간으로
              답변을 확인합니다.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3">
            <div className="flex h-[72px] w-[72px] items-end justify-center overflow-hidden rounded-xl bg-white">
              {profileLoaded ? (
                <CharacterSprite
                  character={character}
                  maxHeight={68}
                  sequenceOverride={frameOverrides[character.id]}
                />
              ) : null}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#666]">
                입장 캐릭터
              </p>
              <p className="mt-1 text-[16px] font-bold text-[#111]">
                {profileLoaded
                  ? `${profile.nickname} · ${character.label[settings.locale]}`
                  : "프로필 불러오는 중"}
              </p>
              <Link
                href="/card-service"
                className="mt-2 inline-flex text-[12px] font-semibold text-[#666] underline underline-offset-4"
              >
                캐릭터 바꾸기
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e5e5e5] px-6 py-6 md:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
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
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="relative block w-full md:w-[336px]">
                <Search
                  aria-hidden="true"
                  size={22}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#666]"
                />
                <input
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="방 검색"
                  className="h-[50px] w-full rounded-lg border border-[#d7d7d7] bg-white pl-12 pr-4 text-[16px] font-medium text-[#111] outline-none placeholder:text-[#aaa] focus:border-[#111]"
                />
              </label>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-[50px] items-center justify-center rounded-lg bg-[#111] px-8 text-[16px] font-bold text-white no-underline transition-opacity hover:opacity-90"
              >
                방 만들기
              </button>
            </div>
          </div>

          <div className="mt-7 min-h-[520px] rounded-2xl border border-[#d9d9d9] bg-white">
            {roomsQuery.isLoading ? (
              <div className="flex min-h-[520px] items-center justify-center text-[16px] font-bold text-[#666]">
                실제 카드방 목록을 불러오는 중...
              </div>
            ) : roomsQuery.isError ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center px-6 text-center">
                <h2 className="text-[28px] font-black tracking-[-0.05em]">
                  목록을 불러오지 못했어요
                </h2>
                <p className="mt-3 text-[#666]">
                  Spring 카드방 API 상태를 확인해 주세요.
                </p>
              </div>
            ) : filteredRooms[0] === undefined ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center px-6 text-center">
                <h2 className="text-[32px] font-black tracking-[-0.05em] text-[#111]">
                  열린 카드방이 없어요
                </h2>
                <p className="mt-3 text-[16px] font-medium leading-6 text-[#666]">
                  내 덱 또는 게스트 덱 스냅샷으로 첫 카드방을 만들어 보세요.
                </p>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-8 rounded-lg bg-[#050505] px-8 py-4 text-[17px] font-bold text-white no-underline transition-colors hover:bg-[#222]"
                >
                  카드방 만들기
                </button>
              </div>
            ) : (
              <div className="grid gap-3 p-4 md:p-5">
                {filteredRooms.map((room) => (
                  <Link
                    key={room.id}
                    href={`/card-service/rooms/${room.id}`}
                    className="group grid gap-5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 no-underline transition-colors hover:border-[#111] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111] md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
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
                      <h2 className="mt-3 text-[18px] font-semibold tracking-[-0.02em] text-[#111]">
                        {room.title}
                      </h2>
                      <p className="mt-2 text-[13px] font-medium text-[#666]">
                        {room.deckTitle} · 방장 {room.hostLabel}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#ddd] bg-white px-3 py-1.5 text-[13px] font-bold text-[#111]">
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

      {isCreateModalOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-card-room-title"
        >
          <button
            type="button"
            aria-label="카드방 만들기 닫기"
            onClick={closeCreateModal}
            className="absolute inset-0 bg-[rgba(0,0,0,0.36)]"
          />
          <div className="relative z-10 max-h-[calc(100vh-3rem)] w-full max-w-[560px] overflow-y-auto rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#e5e5e5] px-6 py-5">
              <div>
                <h2
                  id="create-card-room-title"
                  className="text-[22px] font-black tracking-[-0.04em] text-[#111]"
                >
                  카드방 만들기
                </h2>
                <p className="mt-2 text-[13px] font-medium leading-5 text-[#666]">
                  현재 덱 내용을 고정해 함께 확인할 카드방을 만듭니다.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                aria-label="카드방 만들기 닫기"
                className="-mr-1 rounded-full p-1 text-[#444] transition-colors hover:bg-[#f5f5f5] hover:text-[#111]"
              >
                <X size={28} strokeWidth={1.8} />
              </button>
            </div>
            <div className="p-5 md:p-6">
              <CardRoomCreateForm
                onCancel={closeCreateModal}
                submitLabel="카드방 만들고 입장하기"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
