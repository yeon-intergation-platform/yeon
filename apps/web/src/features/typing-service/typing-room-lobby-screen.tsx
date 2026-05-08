"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Crown, Search, Users, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { TypingServiceHeader } from "./typing-service-header";
import { trackEvent } from "@/lib/analytics";
import {
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_MODE,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  type TypingRoomSummary,
  type TypingRoomVisibility,
} from "@yeon/race-shared";
import {
  useSelectedTypingDeck,
  useTypingSettings,
} from "./use-typing-settings";
import { useTypingRoomLobby } from "./use-typing-room-lobby";
import {
  TYPING_ROOM_DIFFICULTY_LABELS,
  TYPING_ROOM_LANGUAGE_LABELS,
  TYPING_ROOM_MODE_LABELS,
  TYPING_ROOM_STATUS_LABELS,
  TYPING_ROOM_TEXT_TYPE_LABELS,
  TYPING_ROOM_VISIBILITY_LABELS,
} from "./typing-room-labels";

const FIXED_MAX_PARTICIPANTS = 4;
const FIXED_TEXT_TYPE = TYPING_ROOM_TEXT_TYPE.SHORT;
const FIXED_DIFFICULTY = TYPING_ROOM_DIFFICULTY.NORMAL;
const FIXED_ROUND_COUNT = 1;
const FIXED_MODE = TYPING_ROOM_MODE.FINISH;

type LobbyFilter = "all" | "public" | "available";

const FILTERS: { label: string; value: LobbyFilter }[] = [
  { label: "전체", value: "all" },
  { label: "공개방", value: "public" },
  { label: "입장 가능", value: "available" },
];

function getRoomOccupancy(room: TypingRoomSummary) {
  const hostCount = room.currentParticipants > 0 ? 1 : 0;
  const guestCount = Math.max(room.currentParticipants - hostCount, 0);
  const openSeats = Math.max(
    room.maxParticipants - room.currentParticipants,
    0
  );
  const isFull = openSeats === 0;

  return {
    guestCount,
    hostCount,
    isFull,
    openSeats,
    seatLabel: isFull ? "만석" : `${openSeats}자리 남음`,
  };
}

export function TypingRoomLobbyScreen() {
  const router = useRouter();
  const { state } = useTypingRoomLobby();
  const { settings } = useTypingSettings();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<TypingRoomVisibility>(
    TYPING_ROOM_VISIBILITY.PUBLIC
  );
  const [selectedFilter, setSelectedFilter] = useState<LobbyFilter>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const fixedLanguage = settings.locale;
  const deckState = useSelectedTypingDeck(fixedLanguage);
  const roomDeckOptions = useMemo(
    () => deckState.decks.filter((deck) => deck.visibility !== "private"),
    [deckState.decks]
  );
  const selectedDeck = useMemo(
    () =>
      roomDeckOptions.find((deck) => deck.id === deckState.selectedDeckId) ??
      roomDeckOptions[0] ??
      deckState.selectedDeck,
    [deckState.selectedDeck, deckState.selectedDeckId, roomDeckOptions]
  );

  const generatedTitle = `${TYPING_ROOM_LANGUAGE_LABELS[fixedLanguage]} ${TYPING_ROOM_TEXT_TYPE_LABELS[FIXED_TEXT_TYPE]} 같이 치기`;

  const rooms = state.kind === "ready" ? state.rooms : [];
  const filteredRooms = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return rooms.filter((room) => {
      const occupancy = getRoomOccupancy(room);
      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "public" &&
          room.visibility === TYPING_ROOM_VISIBILITY.PUBLIC) ||
        (selectedFilter === "available" && !occupancy.isFull);
      const matchesSearch =
        keyword.length === 0 ||
        room.title.toLowerCase().includes(keyword) ||
        room.roomCode.toLowerCase().includes(keyword) ||
        (room.hostLabel?.toLowerCase().includes(keyword) ?? false);

      return matchesFilter && matchesSearch;
    });
  }, [rooms, searchKeyword, selectedFilter]);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackEvent("room_create_intent", {
      source: "typing_room_lobby",
      visibility,
      language: fixedLanguage,
      deck_id: selectedDeck.id,
      deck_title: selectedDeck.title,
    });
    const params = new URLSearchParams({
      title: title.trim() || generatedTitle,
      visibility,
      maxParticipants: String(FIXED_MAX_PARTICIPANTS),
      textType: FIXED_TEXT_TYPE,
      language: fixedLanguage,
      difficulty: FIXED_DIFFICULTY,
      roundCount: String(FIXED_ROUND_COUNT),
      mode: FIXED_MODE,
      selectedDeckId: selectedDeck.id,
    });
    router.push(`/typing-service/rooms/new?${params.toString()}`);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
    trackEvent("room_create_modal_open", {
      source: "typing_room_lobby",
      language: fixedLanguage,
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <TypingServiceHeader active="rooms" title="YEON 타자방" />

      <main>
        <section className="flex min-h-[174px] items-center justify-between px-6 py-10 md:px-10">
          <div>
            <h1 className="text-[48px] font-black leading-none tracking-[-0.06em] text-[#111] md:text-[56px]">
              타자방
            </h1>
            <p className="mt-5 text-[18px] font-medium leading-7 text-[#666]">
              실시간으로 함께 타자를 치고 실력을 겨루는 공간입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="hidden min-w-[176px] rounded-lg bg-[#050505] px-8 py-5 text-[17px] font-bold text-white shadow-[0_3px_10px_rgba(0,0,0,0.10)] transition-colors hover:bg-[#222] md:inline-flex md:items-center md:justify-center"
          >
            방 만들기
          </button>
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
          </div>

          <div className="mt-7 min-h-[520px] rounded-2xl border border-[#d9d9d9] bg-white">
            {state.kind === "loading" && (
              <div className="flex min-h-[520px] items-center justify-center text-[16px] font-medium text-[#666]">
                열린 타자방을 불러오는 중입니다.
              </div>
            )}

            {state.kind === "error" && (
              <div className="flex min-h-[520px] items-center justify-center px-6 text-center text-[16px] font-semibold text-red-600">
                {state.message}
              </div>
            )}

            {(state.kind === "empty" ||
              (state.kind === "ready" && filteredRooms[0] === undefined)) && (
              <div
                className={`flex min-h-[520px] flex-col items-center px-6 text-center ${
                  isCreateModalOpen
                    ? "justify-start pt-[330px] pb-20"
                    : "justify-center py-20"
                }`}
              >
                <Image
                  src="/illustrations/typing-empty-keyboard.png"
                  alt=""
                  aria-hidden="true"
                  width={160}
                  height={160}
                  className="h-40 w-40 object-contain"
                />
                <h2 className="mt-6 text-[32px] font-black leading-tight tracking-[-0.05em] text-[#111]">
                  {state.kind === "ready"
                    ? "검색 결과가 없어요"
                    : "아직 열린 타자방이 없어요"}
                </h2>
                <p className="mt-3 text-[16px] font-medium leading-6 text-[#666]">
                  {state.kind === "ready"
                    ? "다른 키워드로 검색하거나 첫 방을 만들어 보세요."
                    : "첫 방을 만들어 친구와 함께 시작해보세요."}
                </p>
                <button
                  type="button"
                  onClick={
                    state.kind === "ready"
                      ? () => setSearchKeyword("")
                      : openCreateModal
                  }
                  className="mt-8 rounded-lg bg-[#050505] px-8 py-4 text-[17px] font-bold text-white shadow-[0_3px_10px_rgba(0,0,0,0.10)] transition-colors hover:bg-[#222]"
                >
                  {state.kind === "ready" ? "검색 초기화" : "첫 방 만들기"}
                </button>
              </div>
            )}

            {state.kind === "ready" && filteredRooms[0] !== undefined && (
              <div className="grid gap-3 p-4 md:p-5">
                {filteredRooms.map((room) => {
                  const occupancy = getRoomOccupancy(room);

                  return (
                    <Link
                      key={room.roomId}
                      href={`/typing-service/rooms/${room.roomId}`}
                      aria-label={`${room.title} 입장, ${occupancy.seatLabel}`}
                      className="group grid gap-5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 no-underline transition-colors hover:border-[#111] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111] md:grid-cols-[1fr_auto]"
                      onClick={() =>
                        trackEvent("room_join_click", {
                          source: "typing_room_lobby",
                          room_id: room.roomId,
                          visibility: room.visibility,
                          language: room.language,
                          current_participants: room.currentParticipants,
                        })
                      }
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-[#d9ead3] bg-[#eef8ea] px-2.5 py-1 text-[11px] font-bold text-[#2f7d32]">
                            {TYPING_ROOM_STATUS_LABELS[room.status]}
                          </span>
                          <span className="rounded-full border border-[#e5e5e5] bg-white px-2.5 py-1 text-[11px] font-bold text-[#111]">
                            {occupancy.seatLabel}
                          </span>
                          <span className="font-mono text-[12px] text-[#aaa]">
                            #{room.roomCode}
                          </span>
                        </div>
                        <h2 className="mt-3 text-[18px] font-semibold tracking-[-0.02em] text-[#111]">
                          {room.title}
                        </h2>
                        <p className="mt-2 text-[13px] font-medium text-[#666]">
                          {TYPING_ROOM_LANGUAGE_LABELS[room.language]} ·{" "}
                          {TYPING_ROOM_TEXT_TYPE_LABELS[room.textType]} ·{" "}
                          {TYPING_ROOM_DIFFICULTY_LABELS[room.difficulty]} ·{" "}
                          {room.roundCount}판 ·{" "}
                          {TYPING_ROOM_MODE_LABELS[room.mode]}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-semibold">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-[#666]">
                            <Crown size={13} className="text-[#b7791f]" />{" "}
                            {room.hostLabel
                              ? `${room.hostLabel}님의 방`
                              : `방장 ${occupancy.hostCount}명`}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-[#666]">
                            <Users size={13} className="text-[#111]" /> 참가자{" "}
                            {occupancy.guestCount}명
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#ddd] bg-white px-3 py-1.5 text-[13px] font-bold text-[#111]">
                          <Users size={14} /> {room.currentParticipants} /{" "}
                          {room.maxParticipants}
                        </span>
                        <span className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-bold text-white transition-colors group-hover:bg-[#333]">
                          입장하기
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <button
        type="button"
        onClick={openCreateModal}
        className="fixed bottom-5 right-5 z-30 rounded-full bg-[#050505] px-6 py-4 text-[15px] font-bold text-white shadow-lg md:hidden"
      >
        방 만들기
      </button>

      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-transparent px-4 pt-[168px] md:pt-[244px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-typing-room-title"
        >
          <form
            onSubmit={handleCreate}
            className="w-full max-w-[456px] rounded-xl border border-[#d2d2d2] bg-white p-7 shadow-[0_18px_60px_rgba(0,0,0,0.16)]"
          >
            <div className="flex items-center justify-between gap-4">
              <h2
                id="create-typing-room-title"
                className="text-[22px] font-bold tracking-[-0.03em] text-[#111]"
              >
                방 만들기
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="방 만들기 닫기"
                className="-mr-1 rounded-full p-1 text-[#444] transition-colors hover:bg-[#f5f5f5] hover:text-[#111]"
              >
                <X size={28} strokeWidth={1.8} />
              </button>
            </div>

            <div className="mt-7 grid gap-6">
              <label className="grid gap-3 text-[15px] font-bold text-[#111]">
                방 제목
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="예: 오늘의 타자 연습"
                  maxLength={40}
                  className="h-[50px] rounded-lg border border-[#d7d7d7] bg-white px-4 text-[16px] font-medium text-[#111] outline-none placeholder:text-[#aaa] focus:border-[#111]"
                />
              </label>

              <fieldset className="grid gap-3 text-[15px] font-bold text-[#111]">
                <legend>공개 설정</legend>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    TYPING_ROOM_VISIBILITY.PUBLIC,
                    TYPING_ROOM_VISIBILITY.PRIVATE,
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex h-[52px] cursor-pointer items-center justify-center rounded-lg border text-[16px] font-semibold transition-colors ${
                        visibility === option
                          ? "border-[#111] bg-white text-[#111] shadow-[inset_0_0_0_1px_#111]"
                          : "border-[#d7d7d7] bg-white text-[#111] hover:border-[#111]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={option}
                        checked={visibility === option}
                        onChange={() => setVisibility(option)}
                        className="sr-only"
                      />
                      {TYPING_ROOM_VISIBILITY_LABELS[option]}
                    </label>
                  ))}
                </div>
              </fieldset>

              <p className="text-[14px] font-medium leading-6 text-[#777]">
                세부 설정은 방에 들어간 뒤 시작 전에 바꿀 수 있어요.
              </p>

              <button
                type="submit"
                className="h-[60px] rounded-lg bg-[#050505] px-4 text-[18px] font-bold text-white shadow-[0_3px_10px_rgba(0,0,0,0.10)] transition-colors hover:bg-[#222]"
              >
                만들고 입장하기
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
