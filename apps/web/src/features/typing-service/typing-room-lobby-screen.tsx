"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Crown, RefreshCcw, Users } from "lucide-react";
import {
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_LANGUAGE,
  TYPING_ROOM_MODE,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  type TypingRoomDifficulty,
  type TypingRoomLanguage,
  type TypingRoomMode,
  type TypingRoomTextType,
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

const MAX_PARTICIPANT_OPTIONS = [2, 4] as const;
const ROUND_OPTIONS = [1] as const;

function getRoomOccupancy(room: TypingRoomSummary) {
  const hostCount = room.currentParticipants > 0 ? 1 : 0;
  const guestCount = Math.max(room.currentParticipants - hostCount, 0);
  const openSeats = Math.max(room.maxParticipants - room.currentParticipants, 0);
  const isFull = openSeats === 0;

  return {
    guestCount,
    hostCount,
    isFull,
    openSeats,
    seatLabel: isFull ? "만석" : `${openSeats}자리 남음`,
  };
}

function SelectField<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="grid gap-1.5 text-[12px] font-semibold text-text-secondary">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="rounded-xl border border-border bg-surface px-3 py-2.5 text-[14px] font-medium text-text outline-none transition-colors focus:border-accent-border"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TypingRoomLobbyScreen() {
  const router = useRouter();
  const { profile, loaded } = useTypingProfile();
  const { state, refresh } = useTypingRoomLobby();
  const { settings } = useTypingSettings();
  const [title, setTitle] = useState("한글 짧은 문장 같이 치기");
  const [visibility, setVisibility] = useState<TypingRoomVisibility>(
    TYPING_ROOM_VISIBILITY.PUBLIC,
  );
  const [maxParticipants, setMaxParticipants] = useState<number>(4);
  const [textType, setTextType] = useState<TypingRoomTextType>(
    TYPING_ROOM_TEXT_TYPE.SHORT,
  );
  const [language, setLanguage] = useState<TypingRoomLanguage>(settings.locale);
  const [difficulty, setDifficulty] = useState<TypingRoomDifficulty>(
    TYPING_ROOM_DIFFICULTY.NORMAL,
  );
  const [roundCount, setRoundCount] = useState<number>(1);
  const [mode, setMode] = useState<TypingRoomMode>(TYPING_ROOM_MODE.FINISH);
  const deckState = useSelectedTypingDeck(language);
  const [selectedDeckId, setSelectedDeckId] = useState(
    deckState.selectedDeckId,
  );

  useEffect(() => {
    setSelectedDeckId(deckState.selectedDeckId);
  }, [deckState.selectedDeckId, language]);

  const selectedDeck = useMemo(
    () =>
      deckState.decks.find((deck) => deck.id === selectedDeckId) ??
      deckState.selectedDeck,
    [deckState.decks, deckState.selectedDeck, selectedDeckId],
  );

  const generatedTitle = useMemo(() => {
    if (difficulty === TYPING_ROOM_DIFFICULTY.HARD) return "정확도 95% 도전방";
    return `${TYPING_ROOM_LANGUAGE_LABELS[language]} ${TYPING_ROOM_TEXT_TYPE_LABELS[textType]} 같이 치기`;
  }, [difficulty, language, textType]);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams({
      title: title.trim() || generatedTitle,
      visibility,
      maxParticipants: String(maxParticipants),
      textType,
      language,
      difficulty,
      roundCount: String(roundCount),
      mode,
      selectedDeckId,
    });
    router.push(`/typing-service/rooms/new?${params.toString()}`);
  };

  return (
    <div className="app-theme min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-surface/90 px-6 py-3 backdrop-blur md:px-12">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Link
            href="/typing-service"
            className="inline-flex items-center gap-2 text-[13px] text-text-secondary no-underline transition-colors hover:text-text"
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

      <main className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 md:grid-cols-[1fr_380px] md:px-8">
        <section className="rounded-3xl border border-border bg-surface p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-accent">
                Typing Room Lobby
              </p>
              <h1 className="mt-2 text-[30px] font-black tracking-[-0.04em] md:text-[42px]">
                타자방
              </h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-text-secondary">
                방을 만들고 같은 문장을 동시에 입력해 진행률, 속도, 정확도를
                겨루는 실시간 타자 대결방입니다.
              </p>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-[13px] font-semibold text-text-secondary transition-colors hover:border-border-light hover:bg-surface-3 hover:text-text"
            >
              <RefreshCcw size={14} /> 새로고침
            </button>
          </div>

          <div className="mt-7 grid gap-3">
            {state.kind === "loading" && (
              <div className="rounded-2xl border border-dashed border-border-light bg-surface-2 p-8 text-center text-[14px] text-text-secondary">
                열려 있는 타자방을 불러오는 중...
              </div>
            )}
            {state.kind === "error" && (
              <div className="rounded-2xl border border-red/20 bg-red-dim p-8 text-center text-[14px] text-red">
                {state.message}
              </div>
            )}
            {state.kind === "empty" && (
              <div className="rounded-2xl border border-dashed border-border-light bg-surface-2 p-8 text-center">
                <p className="text-[16px] font-bold text-text">
                  아직 대기중인 공개 타자방이 없어요.
                </p>
                <p className="mt-2 text-[13px] text-text-secondary">
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
                    className={`group grid gap-5 rounded-2xl border p-5 no-underline transition-all hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:grid-cols-[1fr_auto] ${
                      occupancy.isFull
                        ? "border-amber-border bg-amber-dim"
                        : "border-border bg-surface-2 hover:border-accent-border hover:bg-surface-3"
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-green-border bg-green-dim px-2.5 py-1 text-[11px] font-bold text-green">
                          {TYPING_ROOM_STATUS_LABELS[room.status]}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                            occupancy.isFull
                              ? "border-amber-border bg-amber-dim text-amber"
                              : "border-accent-border bg-accent-dim text-accent"
                          }`}
                        >
                          {occupancy.seatLabel}
                        </span>
                        <span className="font-mono text-[12px] text-text-dim">
                          #{room.roomCode}
                        </span>
                      </div>
                      <h2 className="mt-3 text-[20px] font-black tracking-[-0.02em] text-text">
                        {room.title}
                      </h2>
                      <p className="mt-2 text-[13px] font-medium text-text-secondary">
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
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-text-secondary">
                          <Crown size={13} className="text-amber" /> 방장{" "}
                          {occupancy.hostCount}명
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-text-secondary">
                          <Users size={13} className="text-accent" /> 참가자{" "}
                          {occupancy.guestCount}명
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                      <span className="inline-flex items-center gap-2 rounded-full border border-border-light bg-surface px-3 py-1.5 text-[13px] font-bold text-text">
                        <Users size={14} /> {room.currentParticipants} /{" "}
                        {room.maxParticipants}
                      </span>
                      <span
                        className={`rounded-xl px-4 py-2 text-[13px] font-bold transition-colors ${
                          occupancy.isFull
                            ? "border border-amber-border text-amber"
                            : "bg-accent text-text group-hover:bg-[var(--accent-hover)]"
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

        <aside className="rounded-3xl border border-border bg-surface p-5 shadow-[0_24px_80px_rgba(0,0,0,0.2)] md:p-6">
          <h2 className="text-[20px] font-black tracking-[-0.02em]">
            방 만들기
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-text-secondary">
            MVP Slice A는 2명 또는 4명, 짧은 문장, 1라운드 완주 모드만
            지원합니다.
          </p>

          <form onSubmit={handleCreate} className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-[12px] font-semibold text-text-secondary">
              방 제목
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={
                  loaded ? `${profile.nickname}님의 타자방` : generatedTitle
                }
                maxLength={40}
                className="rounded-xl border border-border bg-surface px-3 py-2.5 text-[14px] font-medium text-text outline-none transition-colors placeholder:text-text-dim focus:border-accent-border"
              />
            </label>

            <button
              type="button"
              onClick={() => setTitle(generatedTitle)}
              className="rounded-xl border border-dashed border-border-light bg-surface-2 px-3 py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:border-accent-border hover:text-accent"
            >
              제목 자동 생성: {generatedTitle}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="공개 여부"
                value={visibility}
                options={[TYPING_ROOM_VISIBILITY.PUBLIC]}
                labels={TYPING_ROOM_VISIBILITY_LABELS}
                onChange={setVisibility}
              />
              <label className="grid gap-1.5 text-[12px] font-semibold text-text-secondary">
                최대 인원
                <select
                  value={maxParticipants}
                  onChange={(event) =>
                    setMaxParticipants(Number(event.target.value))
                  }
                  className="rounded-xl border border-border bg-surface px-3 py-2.5 text-[14px] font-medium text-text outline-none transition-colors focus:border-accent-border"
                >
                  {MAX_PARTICIPANT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}명
                    </option>
                  ))}
                </select>
              </label>
              <SelectField
                label="글 종류"
                value={textType}
                options={[TYPING_ROOM_TEXT_TYPE.SHORT]}
                labels={TYPING_ROOM_TEXT_TYPE_LABELS}
                onChange={setTextType}
              />
              <SelectField
                label="언어"
                value={language}
                options={[TYPING_ROOM_LANGUAGE.KO, TYPING_ROOM_LANGUAGE.EN]}
                labels={TYPING_ROOM_LANGUAGE_LABELS}
                onChange={setLanguage}
              />
              <SelectField
                label="난이도"
                value={difficulty}
                options={[
                  TYPING_ROOM_DIFFICULTY.EASY,
                  TYPING_ROOM_DIFFICULTY.NORMAL,
                  TYPING_ROOM_DIFFICULTY.HARD,
                ]}
                labels={TYPING_ROOM_DIFFICULTY_LABELS}
                onChange={setDifficulty}
              />
              <label className="grid gap-1.5 text-[12px] font-semibold text-text-secondary">
                라운드 수
                <select
                  value={roundCount}
                  onChange={(event) =>
                    setRoundCount(Number(event.target.value))
                  }
                  className="rounded-xl border border-border bg-surface px-3 py-2.5 text-[14px] font-medium text-text outline-none transition-colors focus:border-accent-border"
                >
                  {ROUND_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}판
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <SelectField
              label="제한 방식"
              value={mode}
              options={[TYPING_ROOM_MODE.FINISH]}
              labels={TYPING_ROOM_MODE_LABELS}
              onChange={setMode}
            />

            <label className="grid gap-1.5 text-[12px] font-semibold text-text-secondary">
              연습 덱
              <select
                value={selectedDeckId}
                onChange={(event) => setSelectedDeckId(event.target.value)}
                className="rounded-xl border border-border bg-surface px-3 py-2.5 text-[14px] font-medium text-text outline-none transition-colors focus:border-accent-border"
              >
                {deckState.decks.map((deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.title}
                    {deck.visibility === "private"
                      ? " · 비공개"
                      : deck.visibility === "public"
                        ? " · 공개"
                        : " · 기본"}
                  </option>
                ))}
              </select>
              <span className="text-[11px] font-medium text-text-dim">
                {deckState.loading
                  ? "덱을 불러오는 중..."
                  : (deckState.error ?? `선택: ${selectedDeck.title}`)}
              </span>
            </label>

            <button
              type="submit"
              className="mt-2 rounded-2xl bg-accent px-4 py-4 text-[15px] font-bold text-text transition-colors hover:bg-[var(--accent-hover)]"
            >
              타자방 만들기
            </button>
          </form>
        </aside>
      </main>
    </div>
  );
}
