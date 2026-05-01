"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Crown, RefreshCcw, Users } from "lucide-react";
import {
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_MODE,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  type TypingRoomSummary,
  type TypingRoomVisibility,
} from "@yeon/race-shared";
import { useTypingProfile } from "./use-typing-profile";
import {
  useSelectedTypingDeck,
  useTypingSettings,
} from "./use-typing-settings";
import { TypingBgmButton } from "./typing-bgm-button";
import { TypingSettingsButton } from "./typing-settings-button";
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

function getRoomOccupancy(room: TypingRoomSummary) {
  const hostCount = room.currentParticipants > 0 ? 1 : 0;
  const guestCount = Math.max(room.currentParticipants - hostCount, 0);
  const openSeats = Math.max(
    room.maxParticipants - room.currentParticipants,
    0,
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
  const { profile, loaded } = useTypingProfile();
  const { state, refresh } = useTypingRoomLobby();
  const { settings } = useTypingSettings();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("한글 짧은 문장 같이 치기");
  const [visibility, setVisibility] = useState<TypingRoomVisibility>(
    TYPING_ROOM_VISIBILITY.PUBLIC,
  );
  const fixedLanguage = settings.locale;
  const deckState = useSelectedTypingDeck(fixedLanguage);
  const roomDeckOptions = useMemo(
    () => deckState.decks.filter((deck) => deck.visibility !== "private"),
    [deckState.decks],
  );
  const selectedDeck = useMemo(
    () =>
      roomDeckOptions.find((deck) => deck.id === deckState.selectedDeckId) ??
      roomDeckOptions[0] ??
      deckState.selectedDeck,
    [deckState.selectedDeck, deckState.selectedDeckId, roomDeckOptions],
  );

  const generatedTitle = useMemo(() => {
    return `${TYPING_ROOM_LANGUAGE_LABELS[fixedLanguage]} ${TYPING_ROOM_TEXT_TYPE_LABELS[FIXED_TEXT_TYPE]} 같이 치기`;
  }, [fixedLanguage]);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <header className="border-b border-[#e5e5e5] px-6 py-3 md:px-12">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Link
            href="/typing-service"
            className="inline-flex items-center gap-2 text-[13px] text-[#666] no-underline transition-colors hover:text-[#111]"
          >
            <ArrowLeft size={14} />
            타자연습
          </Link>
          <div className="flex items-center gap-2">
            <TypingBgmButton />
            <TypingSettingsButton />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-6 px-6 py-10 md:grid-cols-[minmax(0,1fr)_380px] md:px-12">
        <section className="min-w-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[#888]">
                실시간 타자방
              </p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#111]">
                타자방
              </h1>
              <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-[#666]">
                방을 만들고 같은 문장을 동시에 입력해 진행률, 속도, 정확도를
                겨루는 실시간 타자 대결방입니다.
              </p>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 py-2 text-[13px] font-semibold text-[#666] transition-colors hover:border-[#ddd] hover:bg-[#f1f1f1] hover:text-[#111]"
            >
              <RefreshCcw size={14} /> 새로고침
            </button>
          </div>

          <div className="mt-8 grid gap-3">
            {state.kind === "loading" && (
              <div className="rounded-2xl border border-dashed border-[#ddd] bg-[#fafafa] p-8 text-center text-[14px] text-[#666]">
                열려 있는 타자방을 불러오는 중...
              </div>
            )}
            {state.kind === "error" && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-[14px] text-red-600">
                {state.message}
              </div>
            )}
            {state.kind === "empty" && (
              <div className="rounded-2xl border border-dashed border-[#ddd] bg-[#fafafa] p-8 text-center">
                <p className="text-[16px] font-bold text-[#111]">
                  아직 대기중인 공개 타자방이 없어요.
                </p>
                <p className="mt-2 text-[13px] text-[#666]">
                  오른쪽에서 첫 방을 만들고 초대 링크를 공유해 보세요.
                </p>
              </div>
            )}
            {state.kind === "ready" &&
              state.rooms.map((room) => {
                const occupancy = getRoomOccupancy(room);

                return (
                  <Link
                    key={room.roomId}
                    href={`/typing-service/rooms/${room.roomId}`}
                    aria-label={`${room.title} 입장, ${occupancy.seatLabel}`}
                    className={`group grid gap-5 rounded-2xl border p-5 no-underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111] md:grid-cols-[1fr_auto] ${
                      occupancy.isFull
                        ? "border-[#f4e4b8] bg-[#fff8e1]"
                        : "border-[#e5e5e5] bg-[#fafafa] hover:border-[#111] hover:bg-[#f1f1f1]"
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#d9ead3] bg-[#eef8ea] px-2.5 py-1 text-[11px] font-bold text-[#2f7d32]">
                          {TYPING_ROOM_STATUS_LABELS[room.status]}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                            occupancy.isFull
                              ? "border-[#f4e4b8] bg-[#fff8e1] text-[#b7791f]"
                              : "border-[#e5e5e5] bg-[#f4f4f0] text-[#111]"
                          }`}
                        >
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
                        {(room as { lobbyDeckTitle?: string }).lobbyDeckTitle
                          ? ` · 덱: ${(room as { lobbyDeckTitle?: string }).lobbyDeckTitle}`
                          : ""}
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
                      <span
                        className={`rounded-xl px-4 py-2 text-[13px] font-bold transition-colors ${
                          occupancy.isFull
                            ? "border border-[#f4e4b8] text-[#b7791f]"
                            : "bg-[#111] text-white group-hover:bg-[#333]"
                        }`}
                      >
                        {occupancy.isFull ? "만석 확인" : "입장하기"}
                      </span>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>

        <aside className="grid content-start gap-4 rounded-2xl border border-[#e5e5e5] bg-white p-5 md:p-6">
          <div>
            <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#111]">
              방 만들기
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-[#666]">
              MVP에서는 방 제목과 공개 여부만 정하고, 나머지 설정은 빠른 대결을
              위해 고정됩니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-xl bg-[#111] px-4 py-3 text-[15px] font-bold text-white transition-colors hover:bg-[#333]"
          >
            타자방 만들기
          </button>

          <div className="rounded-2xl border border-dashed border-[#ddd] bg-[#fafafa] p-4 text-[13px] leading-6 text-[#666]">
            <p className="font-bold text-[#111]">MVP 고정 설정</p>
            <ul className="mt-2 list-disc pl-4">
              <li>{FIXED_MAX_PARTICIPANTS}명까지 입장할 수 있어요.</li>
              <li>
                {TYPING_ROOM_LANGUAGE_LABELS[fixedLanguage]} ·{" "}
                {TYPING_ROOM_TEXT_TYPE_LABELS[FIXED_TEXT_TYPE]} ·{" "}
                {TYPING_ROOM_DIFFICULTY_LABELS[FIXED_DIFFICULTY]}
              </li>
              <li>
                {FIXED_ROUND_COUNT}판 · {TYPING_ROOM_MODE_LABELS[FIXED_MODE]}
              </li>
              <li>
                덱: {deckState.loading ? "불러오는 중" : selectedDeck.title}
              </li>
            </ul>
          </div>
        </aside>
      </main>

      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-typing-room-title"
        >
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-3xl border border-[#e5e5e5] bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold text-[#888]">새 타자방</p>
                <h2
                  id="create-typing-room-title"
                  className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-[#111]"
                >
                  방 만들기
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full border border-[#e5e5e5] px-3 py-1.5 text-[12px] font-semibold text-[#666] transition-colors hover:border-[#ddd] hover:text-[#111]"
              >
                닫기
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-1.5 text-[12px] font-semibold text-[#666]">
                방 제목
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={
                    loaded ? `${profile.nickname}님의 타자방` : generatedTitle
                  }
                  maxLength={40}
                  autoFocus
                  className="rounded-xl border border-[#e5e5e5] bg-white px-3 py-2.5 text-[14px] font-medium text-[#111] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#111]"
                />
              </label>

              <button
                type="button"
                onClick={() => setTitle(generatedTitle)}
                className="rounded-xl border border-dashed border-[#ddd] bg-[#fafafa] px-3 py-2 text-[12px] font-semibold text-[#666] transition-colors hover:border-[#111] hover:text-[#111]"
              >
                제목 자동 생성: {generatedTitle}
              </button>

              <fieldset className="grid gap-2 text-[12px] font-semibold text-[#666]">
                <legend>공개 여부</legend>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    TYPING_ROOM_VISIBILITY.PUBLIC,
                    TYPING_ROOM_VISIBILITY.PRIVATE,
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-[13px] font-bold transition-colors ${
                        visibility === option
                          ? "border-[#111] bg-[#111] text-white"
                          : "border-[#e5e5e5] bg-white text-[#666] hover:border-[#ddd] hover:text-[#111]"
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

              <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4 text-[12px] leading-5 text-[#666]">
                <p className="font-bold text-[#111]">고정 설정</p>
                <p className="mt-1">
                  {FIXED_MAX_PARTICIPANTS}명 ·{" "}
                  {TYPING_ROOM_LANGUAGE_LABELS[fixedLanguage]} ·{" "}
                  {TYPING_ROOM_TEXT_TYPE_LABELS[FIXED_TEXT_TYPE]} ·{" "}
                  {TYPING_ROOM_DIFFICULTY_LABELS[FIXED_DIFFICULTY]} ·{" "}
                  {FIXED_ROUND_COUNT}판 · {TYPING_ROOM_MODE_LABELS[FIXED_MODE]}
                </p>
                <p className="mt-1">
                  덱: {deckState.loading ? "불러오는 중" : selectedDeck.title}
                </p>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-[#111] px-4 py-3 text-[15px] font-bold text-white transition-colors hover:bg-[#333]"
              >
                대기방 열기
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
