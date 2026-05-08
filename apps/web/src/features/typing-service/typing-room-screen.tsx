"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Crown, Play, Users } from "lucide-react";
import {
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_LANGUAGE,
  TYPING_ROOM_MODE,
  TYPING_ROOM_STATUS,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  type TypingRoomCreateMessage,
  type TypingRoomDifficulty,
  type TypingRoomLanguage,
  type TypingRoomMode,
  type TypingRoomTextType,
  type TypingRoomVisibility,
} from "@yeon/race-shared";
import { usePlayerIdentity } from "./use-player-identity";
import { useRaceRoom } from "./use-race-room";
import { useTypingProfile } from "./use-typing-profile";
import { TypingBgmButton } from "./typing-bgm-button";
import { TypingRaceMultiplayerScreen } from "./typing-race-multiplayer-screen";
import { TypingSettingsButton } from "./typing-settings-button";
import { TypingServiceHeader } from "./typing-service-header";
import {
  TYPING_ROOM_DIFFICULTY_LABELS,
  TYPING_ROOM_LANGUAGE_LABELS,
  TYPING_ROOM_MODE_LABELS,
  TYPING_ROOM_TEXT_TYPE_LABELS,
  TYPING_ROOM_VISIBILITY_LABELS,
} from "./typing-room-labels";
import {
  resolveTypingRaceSeed,
  useSelectedTypingDeck,
  useTypingSettings,
  type TypingDeckOption,
  type TypingRaceSeed,
} from "./use-typing-settings";
import { resolveTypingRoomSelectedDeck } from "./typing-room-selection";
import { trackEvent } from "@/lib/analytics";

type TypingRoomScreenProps = {
  roomId?: string;
  mode: "create" | "join";
};

function parseEnum<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T
): T {
  return value && allowed.includes(value as T) ? (value as T) : fallback;
}

function parseNumber(
  value: string | null,
  allowed: readonly number[],
  fallback: number
) {
  const parsed = Number(value);
  return allowed.includes(parsed) ? parsed : fallback;
}

type DeckAwareCreateMessage = TypingRoomCreateMessage & {
  language: TypingRoomLanguage;
  selectedDeckId?: string;
  selectedDeckVisibility?: "default" | "public" | "private";
  lobbyDeckTitle?: string;
  participantDeckTitle?: string;
  raceSeed?: TypingRaceSeed;
};

function useCreateRoomOptions(): DeckAwareCreateMessage {
  const searchParams = useSearchParams();
  return useMemo(() => {
    const language = parseEnum<TypingRoomLanguage>(
      searchParams.get("language"),
      [TYPING_ROOM_LANGUAGE.KO, TYPING_ROOM_LANGUAGE.EN],
      TYPING_ROOM_LANGUAGE.KO
    );
    return {
      selectedDeckId: searchParams.get("selectedDeckId") ?? undefined,
      title: (searchParams.get("title") || "한글 짧은 문장 같이 치기").slice(
        0,
        40
      ),
      visibility: parseEnum<TypingRoomVisibility>(
        searchParams.get("visibility"),
        [TYPING_ROOM_VISIBILITY.PUBLIC, TYPING_ROOM_VISIBILITY.PRIVATE],
        TYPING_ROOM_VISIBILITY.PUBLIC
      ),
      maxParticipants: parseNumber(
        searchParams.get("maxParticipants"),
        [2, 4],
        4
      ),
      textType: parseEnum<TypingRoomTextType>(
        searchParams.get("textType"),
        [TYPING_ROOM_TEXT_TYPE.SHORT],
        TYPING_ROOM_TEXT_TYPE.SHORT
      ),
      language,
      difficulty: parseEnum<TypingRoomDifficulty>(
        searchParams.get("difficulty"),
        [
          TYPING_ROOM_DIFFICULTY.EASY,
          TYPING_ROOM_DIFFICULTY.NORMAL,
          TYPING_ROOM_DIFFICULTY.HARD,
        ],
        TYPING_ROOM_DIFFICULTY.NORMAL
      ),
      roundCount: parseNumber(searchParams.get("roundCount"), [1], 1),
      mode: parseEnum<TypingRoomMode>(
        searchParams.get("mode"),
        [TYPING_ROOM_MODE.FINISH],
        TYPING_ROOM_MODE.FINISH
      ),
    };
  }, [searchParams]);
}

export function TypingRoomScreen({ roomId, mode }: TypingRoomScreenProps) {
  const { profile, loaded: profileLoaded } = useTypingProfile();
  const { settings } = useTypingSettings();
  const playerId = usePlayerIdentity();
  const createRoomOptions = useCreateRoomOptions();
  const deckState = useSelectedTypingDeck(createRoomOptions.language);
  const selectedDeck = useMemo<TypingDeckOption>(
    () =>
      resolveTypingRoomSelectedDeck(
        createRoomOptions.selectedDeckId,
        deckState.decks,
        deckState.selectedDeck,
        createRoomOptions.language
      ),
    [
      createRoomOptions.language,
      createRoomOptions.selectedDeckId,
      deckState.decks,
      deckState.selectedDeck,
    ]
  );
  const [seedState, setSeedState] = useState<
    | { kind: "idle" | "loading" }
    | { kind: "ready"; seed: TypingRaceSeed | null }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [seedRetryToken, setSeedRetryToken] = useState(0);
  const [useDefaultFallback, setUseDefaultFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const trackedRoomEntryRef = useRef<string | null>(null);
  const hasTrackedRoomCreateSuccessRef = useRef(false);

  useEffect(() => {
    if (mode !== "create") return;
    let cancelled = false;
    setSeedState({ kind: "loading" });

    if (useDefaultFallback || !createRoomOptions.selectedDeckId) {
      setSeedState({ kind: "ready", seed: null });
      return;
    }

    resolveTypingRaceSeed(selectedDeck, createRoomOptions.language).then(
      (result) => {
        if (cancelled) return;
        if (result.ok) setSeedState({ kind: "ready", seed: result.seed });
        else setSeedState({ kind: "error", message: result.message });
      }
    );

    return () => {
      cancelled = true;
    };
  }, [
    createRoomOptions.language,
    createRoomOptions.selectedDeckId,
    mode,
    seedRetryToken,
    selectedDeck,
    useDefaultFallback,
  ]);

  const deckAwareCreateRoomOptions =
    useMemo<DeckAwareCreateMessage | null>(() => {
      if (mode !== "create") return null;
      if (seedState.kind !== "ready") return null;
      if (useDefaultFallback) {
        return { ...createRoomOptions, selectedDeckId: undefined };
      }
      return {
        ...createRoomOptions,
        selectedDeckId: selectedDeck.id,
        selectedDeckVisibility: selectedDeck.visibility,
        lobbyDeckTitle:
          selectedDeck.visibility === "private"
            ? "비공개 덱"
            : selectedDeck.title,
        participantDeckTitle: selectedDeck.title,
        raceSeed: seedState.seed ?? undefined,
      };
    }, [createRoomOptions, mode, seedState, selectedDeck, useDefaultFallback]);

  const race = useRaceRoom({
    enabled:
      profileLoaded &&
      !!playerId &&
      (mode !== "create" || !!deckAwareCreateRoomOptions),
    playerLabel: profile.nickname,
    playerId,
    locale: settings.locale,
    roomId: mode === "join" ? roomId : null,
    createRoom: deckAwareCreateRoomOptions,
  });

  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    if (!race.roomId || hasTrackedRoomCreateSuccessRef.current) {
      return;
    }

    hasTrackedRoomCreateSuccessRef.current = true;
    trackEvent("room_create_success", {
      source: "typing_room_create",
      room_id: race.roomId,
      visibility: createRoomOptions.visibility,
      language: createRoomOptions.language,
      deck_id: selectedDeck.id,
      deck_title: selectedDeck.title,
    });
  }, [
    createRoomOptions.language,
    createRoomOptions.visibility,
    mode,
    race.roomId,
    selectedDeck.id,
    selectedDeck.title,
  ]);

  const room = race.roomSnapshot;
  const me =
    room?.participants.find((participant) => participant.id === race.mySeat) ??
    null;
  const isHost = me?.role === "host";
  const isReady = Boolean(me?.isReady);
  const hostParticipant =
    room?.participants.find((participant) => participant.role === "host") ??
    null;
  const guestCount = Math.max((room?.currentParticipants ?? 0) - 1, 0);
  const openSeatCount = room
    ? Math.max(room.maxParticipants - room.currentParticipants, 0)
    : 0;
  const inviteUrl =
    typeof window === "undefined" || !race.roomId
      ? ""
      : `${window.location.origin}/typing-service/rooms/${race.roomId}`;

  useEffect(() => {
    if (!room || !race.roomId) {
      return;
    }

    const trackingKey = `${mode}:${race.roomId}`;
    if (trackedRoomEntryRef.current === trackingKey) {
      return;
    }

    trackedRoomEntryRef.current = trackingKey;
    trackEvent(
      mode === "create" ? "room_created" : "room_joined",
      {
        source: "typing_room",
        room_id: race.roomId,
        visibility: room.visibility,
        current_participants: room.currentParticipants,
        max_participants: room.maxParticipants,
        selected_deck_id:
          mode === "create"
            ? (deckAwareCreateRoomOptions?.selectedDeckId ?? null)
            : null,
      }
    );
  }, [deckAwareCreateRoomOptions, mode, race.roomId, room]);

  const copyInvite = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      trackEvent("room_invite_copy", {
        source: "typing_room",
        room_id: race.roomId ?? roomId ?? null,
        mode,
      });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  if (mode === "create" && seedState.kind === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#111]">
        <div className="flex flex-col items-center gap-3 text-center font-mono text-[13px] text-[#666]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#111]" />
          <span>선택한 덱에서 레이스 문장을 준비하는 중...</span>
        </div>
      </div>
    );
  }

  if (mode === "create" && seedState.kind === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-[#111]">
        <div className="max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-8 text-center">
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-[#111]">
            덱 문장을 준비하지 못했어요
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-[#666]">
            {seedState.message}
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setSeedRetryToken((value) => value + 1)}
              className="rounded-xl bg-[#111] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#333]"
            >
              다시 시도
            </button>
            <button
              type="button"
              onClick={() => setUseDefaultFallback(true)}
              className="rounded-xl border border-[#e5e5e5] bg-white px-5 py-3 text-[14px] font-semibold text-[#666] transition-colors hover:border-[#ddd] hover:text-[#111]"
            >
              기본 덱으로 시작
            </button>
          </div>
          <Link
            href="/typing-service/rooms"
            className="mt-4 inline-flex text-[13px] font-semibold text-[#666] no-underline transition-colors hover:text-[#111]"
          >
            로비로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (race.connectionState === "connecting" || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#111]">
        <div className="flex flex-col items-center gap-3 font-mono text-[13px] text-[#666]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#111]" />
          <span>
            {mode === "create"
              ? "타자방을 만드는 중..."
              : "타자방에 입장하는 중..."}
          </span>
        </div>
      </div>
    );
  }

  if (
    race.connectionState === "error" ||
    race.connectionState === "disconnected"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-[#111]">
        <div className="max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-8 text-center">
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-[#111]">
            타자방에 연결할 수 없어요
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-[#666]">
            방이 이미 시작됐거나 서버 연결이 끊겼을 수 있어요. 로비에서 대기중인
            방을 다시 확인해 주세요.
          </p>
          <Link
            href="/typing-service/rooms"
            className="mt-6 inline-flex rounded-xl bg-[#111] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#333] no-underline"
          >
            로비로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (room.status !== TYPING_ROOM_STATUS.WAITING) {
    return <TypingRaceMultiplayerScreen race={race} />;
  }

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <TypingServiceHeader
        active="rooms"
        title="YEON 타자방"
        controls={
          <>
            <Link
              href="/typing-service/rooms"
              className="rounded-xl border border-[#e5e5e5] px-4 py-2 text-[13px] font-semibold text-[#111] no-underline transition-colors hover:border-[#111] hover:bg-[#fafafa]"
            >
              타자방 로비
            </Link>
            <TypingBgmButton />
            <TypingSettingsButton />
          </>
        }
      />

      <main className="grid gap-6 px-6 py-10 md:grid-cols-[1fr_360px] md:px-10">
        <section className="rounded-2xl border border-[#e5e5e5] bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#d9ead3] bg-[#eef8ea] px-2.5 py-1 text-[11px] font-bold text-[#2f7d32]">
                  대기중
                </span>
                <span className="font-mono text-[12px] text-[#aaa]">
                  #{room.roomCode}
                </span>
                <span className="rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1 text-[11px] font-bold text-[#666]">
                  {TYPING_ROOM_VISIBILITY_LABELS[room.visibility]}
                </span>
              </div>
              <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-[#111]">
                {room.title}
              </h1>
              <p className="mt-3 text-[14px] font-medium text-[#666]">
                {TYPING_ROOM_LANGUAGE_LABELS[room.language]} ·{" "}
                {TYPING_ROOM_TEXT_TYPE_LABELS[room.textType]} ·{" "}
                {TYPING_ROOM_DIFFICULTY_LABELS[room.difficulty]} ·{" "}
                {room.roundCount}판 · {TYPING_ROOM_MODE_LABELS[room.mode]}
                {(
                  room as {
                    participantDeckTitle?: string;
                    lobbyDeckTitle?: string;
                  }
                ).participantDeckTitle ||
                (
                  room as {
                    participantDeckTitle?: string;
                    lobbyDeckTitle?: string;
                  }
                ).lobbyDeckTitle
                  ? ` · 덱: ${(room as { participantDeckTitle?: string; lobbyDeckTitle?: string }).participantDeckTitle ?? (room as { participantDeckTitle?: string; lobbyDeckTitle?: string }).lobbyDeckTitle}`
                  : ""}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1.5 text-[#666]">
                  <Crown size={13} className="text-[#b7791f]" /> 방장{" "}
                  {hostParticipant?.label ?? "입장 대기"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1.5 text-[#666]">
                  <Users size={13} className="text-[#111]" /> 참가자{" "}
                  {guestCount}명 · 빈자리 {openSeatCount}개
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-center">
              <p className="text-[12px] font-semibold text-[#888]">인원</p>
              <p className="mt-1 text-[24px] font-semibold text-[#111]">
                {room.currentParticipants} / {room.maxParticipants}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            <h2 className="text-[16px] font-semibold text-[#111]">참여자</h2>
            {room.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[15px] font-semibold">
                    {participant.role === "host" ? (
                      <Crown size={18} className="text-[#b7791f]" />
                    ) : (
                      participant.label.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#111]">
                      {participant.label}
                    </p>
                    <p className="text-[12px] text-[#aaa]">
                      {participant.role === "host" ? "방장" : "참가자"}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[12px] font-bold ${participant.isReady ? "border border-[#d9ead3] bg-[#eef8ea] text-[#2f7d32]" : "border border-[#e5e5e5] bg-[#f1f1f1] text-[#aaa]"}`}
                >
                  {participant.isReady ? "준비완료" : "대기중"}
                </span>
              </div>
            ))}
          </div>

          {race.roomError && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">
              {race.roomError}
            </div>
          )}
        </section>

        <aside className="grid content-start gap-4 rounded-2xl border border-[#e5e5e5] bg-white p-5 md:p-6">
          <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 text-[#111]">
            <p className="text-[13px] font-semibold text-[#666]">시작 준비</p>
            <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">
              3, 2, 1
            </p>
            <p className="mt-2 text-[13px] leading-5 text-[#666]">
              방장이 시작하면 모두에게 같은 제시문과 카운트다운이 동시에 뜹니다.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-[#ddd] bg-[#fafafa] p-4 text-[13px] leading-6 text-[#666]">
            <p className="font-bold text-[#111]">방 설정</p>
            <dl className="mt-2 grid grid-cols-[80px_1fr] gap-x-3 gap-y-1">
              <dt>공개 여부</dt>
              <dd className="font-semibold text-[#111]">
                {TYPING_ROOM_VISIBILITY_LABELS[room.visibility]}
              </dd>
              <dt>인원</dt>
              <dd className="font-semibold text-[#111]">
                최대 {room.maxParticipants}명
              </dd>
              <dt>문장</dt>
              <dd className="font-semibold text-[#111]">
                {TYPING_ROOM_LANGUAGE_LABELS[room.language]} ·{" "}
                {TYPING_ROOM_TEXT_TYPE_LABELS[room.textType]}
              </dd>
              <dt>진행</dt>
              <dd className="font-semibold text-[#111]">
                {TYPING_ROOM_DIFFICULTY_LABELS[room.difficulty]} ·{" "}
                {room.roundCount}판 · {TYPING_ROOM_MODE_LABELS[room.mode]}
              </dd>
            </dl>
            <p className="mt-2 text-[12px] text-[#888]">
              MVP에서는 대기방에서 설정을 변경할 수 없습니다.
            </p>
          </div>

          {!isHost && (
            <button
              type="button"
              onClick={() => race.sendReady(!isReady)}
              className={`rounded-2xl px-4 py-4 text-[15px] font-semibold text-[#111] transition-colors ${isReady ? "border border-[#e5e5e5] bg-[#fafafa] text-[#666] hover:border-[#ddd] hover:text-[#111]" : "bg-[#111] text-white hover:bg-[#333]"}`}
            >
              {isReady ? "준비 취소" : "준비하기"}
            </button>
          )}

          {isHost && (
            <button
              type="button"
              onClick={race.sendStart}
              disabled={!room.canStart}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111] px-4 py-4 text-[15px] font-semibold text-[#111] text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#f1f1f1] disabled:text-[#aaa]"
            >
              <Play size={16} /> 시작하기
            </button>
          )}

          <button
            type="button"
            onClick={copyInvite}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-[13px] font-semibold text-[#666] transition-colors hover:border-[#ddd] hover:text-[#111]"
          >
            <Copy size={14} /> {copied ? "초대 링크 복사됨" : "초대 링크 복사"}
          </button>
          <label className="grid gap-1.5 text-[12px] font-semibold text-[#666]">
            초대 링크
            <input
              readOnly
              value={inviteUrl}
              className="w-full rounded-xl border border-[#e5e5e5] bg-white px-3 py-2 font-mono text-[12px] text-[#111]"
            />
          </label>

          <div className="rounded-2xl border border-dashed border-[#ddd] bg-[#fafafa] p-4 text-[13px] leading-6 text-[#666]">
            <p className="flex items-center gap-2 font-bold text-[#111]">
              <Users size={14} /> MVP 규칙
            </p>
            <ul className="mt-2 list-disc pl-4">
              <li>방장은 자동 준비 완료입니다.</li>
              <li>참가자가 모두 준비하면 시작할 수 있습니다.</li>
              <li>진행 중인 방은 새 참가자가 들어올 수 없습니다.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
