"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Crown, Play, Send } from "lucide-react";
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
  type RoomSettingsUpdateMessage,
} from "@yeon/race-shared";
import { CharacterSprite } from "./character-sprite";
import { findCharacter } from "./characters";
import { useCharacterFrameOverrides } from "./use-character-frame-overrides";
import { usePlayerIdentity } from "./use-player-identity";
import { useRaceRoom } from "./use-race-room";
import { useTypingProfile } from "./use-typing-profile";
import { TypingRaceMultiplayerScreen } from "./typing-race-multiplayer-screen";
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

type DeckAwareCreateMessage = TypingRoomCreateMessage & {
  language: TypingRoomLanguage;
  selectedDeckId?: string;
  selectedDeckVisibility?: "default" | "public" | "private";
  lobbyDeckTitle?: string;
  participantDeckTitle?: string;
  raceSeed?: TypingRaceSeed;
};

const LOBBY_MAX_PARTICIPANT_OPTIONS = [2, 3, 4] as const;
const LOBBY_ROUND_COUNT_OPTIONS = [1, 3, 5] as const;
const MAX_LOBBY_CHAT_LENGTH = 500;

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

function normalizeDeckTitle(deck: TypingDeckOption) {
  return deck.visibility === "private" ? "비공개 덱" : deck.title;
}

function parseModeLabel(mode: TypingRoomMode) {
  return mode === TYPING_ROOM_MODE.TIME_LIMIT ? "시간 제한" : "완주 모드";
}

function buildRoomSummary({
  language,
  textType,
  difficulty,
  roundCount,
  mode,
  deckTitle,
}: {
  language: TypingRoomLanguage;
  textType: TypingRoomTextType;
  difficulty: TypingRoomDifficulty;
  roundCount: number;
  mode: TypingRoomMode;
  deckTitle: string;
}) {
  return [
    TYPING_ROOM_LANGUAGE_LABELS[language],
    TYPING_ROOM_TEXT_TYPE_LABELS[textType],
    TYPING_ROOM_DIFFICULTY_LABELS[difficulty],
    `${roundCount}판`,
    parseModeLabel(mode),
    deckTitle,
  ].join(" · ");
}

function useCreateRoomOptions(): DeckAwareCreateMessage {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const language = parseEnum<TypingRoomLanguage>(
      searchParams.get("language"),
      [
        TYPING_ROOM_LANGUAGE.KO,
        TYPING_ROOM_LANGUAGE.EN,
        TYPING_ROOM_LANGUAGE.CODE,
      ],
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
        LOBBY_MAX_PARTICIPANT_OPTIONS,
        4
      ),
      textType: parseEnum<TypingRoomTextType>(
        searchParams.get("textType"),
        [
          TYPING_ROOM_TEXT_TYPE.SHORT,
          TYPING_ROOM_TEXT_TYPE.LONG,
          TYPING_ROOM_TEXT_TYPE.CODE,
        ],
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
      roundCount: parseNumber(
        searchParams.get("roundCount"),
        LOBBY_ROUND_COUNT_OPTIONS,
        1
      ),
      mode: parseEnum<TypingRoomMode>(
        searchParams.get("mode"),
        [TYPING_ROOM_MODE.FINISH, TYPING_ROOM_MODE.TIME_LIMIT],
        TYPING_ROOM_MODE.FINISH
      ),
    };
  }, [searchParams]);
}

export function TypingRoomScreen({ roomId, mode }: TypingRoomScreenProps) {
  const router = useRouter();
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
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [chatDraft, setChatDraft] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [useDefaultFallback, setUseDefaultFallback] = useState(false);
  const [isLeavingRoom, setIsLeavingRoom] = useState(false);
  const trackedRoomEntryRef = useRef<string | null>(null);
  const hasTrackedRoomCreateSuccessRef = useRef(false);

  useEffect(() => {
    if (mode !== "create") return;
    let cancelled = false;
    setSeedState({ kind: "loading" });

    if (useDefaultFallback) {
      setSeedState({ kind: "ready", seed: null });
      return;
    }

    resolveTypingRaceSeed(selectedDeck, createRoomOptions.language).then(
      (result) => {
        if (cancelled) return;
        if (result.ok) {
          setSeedState({ kind: "ready", seed: result.seed });
        } else {
          setSeedState({ kind: "error", message: result.message });
        }
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
    characterId: profile.characterId,
    locale: settings.locale,
    roomId: mode === "join" ? roomId : null,
    createRoom: deckAwareCreateRoomOptions,
  });

  useEffect(() => {
    if (mode !== "create") return;
    if (!race.roomId || hasTrackedRoomCreateSuccessRef.current) {
      return;
    }

    hasTrackedRoomCreateSuccessRef.current = true;
    router.replace(`/typing-service/rooms/${race.roomId}`);
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
    router,
    selectedDeck.id,
    selectedDeck.title,
  ]);

  const room = race.roomSnapshot;
  const me =
    room?.participants.find((participant) => participant.id === race.mySeat) ??
    null;
  const isHost = me?.role === "host";
  const isReady = Boolean(me?.isReady);
  const inviteUrl =
    typeof window === "undefined" || !race.roomId
      ? ""
      : `${window.location.origin}/typing-service/rooms/${race.roomId}`;

  useEffect(() => {
    if (!room || !race.roomId) return;

    const trackingKey = `${mode}:${race.roomId}`;
    if (trackedRoomEntryRef.current === trackingKey) return;

    trackedRoomEntryRef.current = trackingKey;
    trackEvent(mode === "create" ? "room_created" : "room_joined", {
      source: "typing_room",
      room_id: race.roomId,
      visibility: room.visibility,
      current_participants: room.currentParticipants,
      max_participants: room.maxParticipants,
      selected_deck_id:
        mode === "create"
          ? (deckAwareCreateRoomOptions?.selectedDeckId ?? null)
          : null,
    });
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
      setCopyError(null);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
      setCopyError("링크를 복사할 수 없습니다.");
    }
  };

  const sendSetting = useCallback(
    (payload: RoomSettingsUpdateMessage) => {
      if (!isHost || room?.status !== TYPING_ROOM_STATUS.WAITING) return;
      setSettingsError(null);
      race.sendRoomSettings(payload);
    },
    [isHost, room?.status, race]
  );

  const canSendChat = Boolean(
    room?.status === TYPING_ROOM_STATUS.WAITING &&
    chatDraft.trim() &&
    chatDraft.length <= MAX_LOBBY_CHAT_LENGTH
  );

  const onChatSubmit = useCallback(() => {
    if (!chatDraft.trim()) {
      return;
    }
    if (chatDraft.length > MAX_LOBBY_CHAT_LENGTH) {
      setChatError(
        `채팅은 최대 ${MAX_LOBBY_CHAT_LENGTH}자까지 보낼 수 있어요.`
      );
      return;
    }

    setChatError(null);
    race.sendChat(chatDraft.trim());
    setChatDraft("");
  }, [chatDraft, race]);

  const onDeckChange = useCallback(
    async (event: ChangeEvent<HTMLSelectElement>) => {
      const deckId = event.target.value;
      const targetDeck = deckState.decks.find((deck) => deck.id === deckId);
      if (!targetDeck) return;

      const result = await resolveTypingRaceSeed(
        targetDeck,
        room?.language ?? createRoomOptions.language
      );

      if (!result.ok) {
        setSettingsError(result.message);
        return;
      }

      sendSetting({
        selectedDeckId: deckId,
        selectedDeckVisibility: targetDeck.visibility,
        lobbyDeckTitle: normalizeDeckTitle(targetDeck),
        raceSeed: result.seed,
      });
    },
    [createRoomOptions.language, deckState.decks, room?.language, sendSetting]
  );

  const onStart = useCallback(async () => {
    if (!isHost || !room?.canStart) return;

    const activeDeck =
      deckState.decks.find((deck) => deck.id === room.selectedDeckId) ??
      selectedDeck;
    const result = await resolveTypingRaceSeed(activeDeck, room.language);

    if (!result.ok) {
      setSettingsError(result.message);
      return;
    }

    setSettingsError(null);
    race.sendStart({
      raceSeed: result.seed ?? undefined,
    });
  }, [
    deckState.decks,
    isHost,
    race,
    room?.canStart,
    room?.language,
    room?.selectedDeckId,
    selectedDeck,
  ]);

  const onLeaveRoom = useCallback(async () => {
    if (isLeavingRoom) return;

    setIsLeavingRoom(true);
    await race.leaveRoom();
    router.push("/typing-service/rooms");
  }, [isLeavingRoom, race, router]);

  const onRoomNavigationClickCapture = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search &&
        destination.hash === window.location.hash
      ) {
        return;
      }

      event.preventDefault();
      if (isLeavingRoom) return;

      const nextPath = `${destination.pathname}${destination.search}${destination.hash}`;
      setIsLeavingRoom(true);
      void race.leaveRoom().finally(() => {
        router.push(nextPath);
      });
    },
    [isLeavingRoom, race, router]
  );

  const deckOptions = useMemo<TypingDeckOption[]>(() => {
    const language = room?.language ?? createRoomOptions.language;
    const options = deckState.decks.filter(
      (deck) =>
        deck.languageTag === "mixed" ||
        deck.languageTag === language ||
        deck.id === room?.selectedDeckId
    );
    if (
      room?.selectedDeckId &&
      !options.some((deck) => deck.id === room.selectedDeckId)
    ) {
      return options;
    }
    return options;
  }, [
    createRoomOptions.language,
    deckState.decks,
    room?.language,
    room?.selectedDeckId,
  ]);

  const roomDeckTitle = room?.lobbyDeckTitle ?? "기본 타자 문장";
  const frameOverrides = useCharacterFrameOverrides();
  const summaryLanguage =
    room?.language ?? createRoomOptions.language ?? TYPING_ROOM_LANGUAGE.KO;
  const summaryTextType =
    room?.textType ?? createRoomOptions.textType ?? TYPING_ROOM_TEXT_TYPE.SHORT;
  const summaryDifficulty =
    room?.difficulty ??
    createRoomOptions.difficulty ??
    TYPING_ROOM_DIFFICULTY.NORMAL;
  const summaryRoundCount =
    room?.roundCount ?? createRoomOptions.roundCount ?? 1;
  const summaryMode =
    room?.mode ?? createRoomOptions.mode ?? TYPING_ROOM_MODE.FINISH;
  const roomSummary = buildRoomSummary({
    language: summaryLanguage,
    textType: summaryTextType,
    difficulty: summaryDifficulty,
    roundCount: summaryRoundCount,
    mode: summaryMode,
    deckTitle: roomDeckTitle,
  });

  const participants = useMemo(() => {
    const values = room?.participants ?? [];
    const host = values.find((item) => item.role === "host");
    const guests = values.filter((item) => item.role === "guest");
    const ordered = host ? [host, ...guests] : [...values];
    const maxSlots = room?.maxParticipants ?? 0;
    const padded = Array.from(
      { length: Math.max(maxSlots - ordered.length, 0) },
      () => null
    );
    return [...ordered, ...padded].slice(0, maxSlots);
  }, [room?.maxParticipants, room?.participants]);

  const messages = useMemo(() => room?.messages ?? [], [room?.messages]);
  const hasMessages = messages.length > 0;
  const waitingStateLabel =
    room?.status === TYPING_ROOM_STATUS.WAITING ? "대기중" : room?.status;

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
            {race.roomError ??
              "방이 이미 시작되었거나 서버 연결이 끊겼을 수 있어요."}
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
    <div
      className="min-h-screen bg-white text-[#111]"
      onClickCapture={onRoomNavigationClickCapture}
    >
      <TypingServiceHeader active="rooms" title="타자방" />
      {copyError && (
        <p className="mx-4 mt-2 rounded-md border border-red-100 bg-red-50 p-2 text-[12px] text-red-600 md:mx-8">
          {copyError}
        </p>
      )}

      <main className="grid gap-3 px-4 py-3 md:px-8 md:py-4">
        <button
          type="button"
          onClick={onLeaveRoom}
          disabled={isLeavingRoom}
          className="inline-flex w-fit items-center gap-2 text-[13px] font-semibold text-[#666] no-underline transition-colors hover:text-[#111]"
        >
          <ArrowLeft size={15} />
          {isLeavingRoom ? "나가는 중..." : "타자방 나가기"}
        </button>

        <header className="rounded-2xl border border-[#e5e5e5] bg-white p-3 md:p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]">
            <div>
              <p className="text-[12px] font-semibold text-[#666]">
                {waitingStateLabel} ·{" "}
                {TYPING_ROOM_VISIBILITY_LABELS[room.visibility]} ·{" "}
                {room.currentParticipants}/{room.maxParticipants}
              </p>
              <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.03em] md:text-[26px]">
                {room.title}
              </h1>
              <p className="mt-1 text-[12px] text-[#666]">{room.roomCode}</p>
            </div>
            <div className="flex h-full flex-col items-start justify-end gap-3 lg:items-end lg:text-right">
              <p className="text-[12px] font-semibold text-[#666]">
                참여자 {room.currentParticipants} / {room.maxParticipants}
              </p>
              <p className="max-w-[420px] text-[12px] leading-5 text-[#666]">
                {roomSummary}
              </p>

              {race.roomError && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-[12px] text-red-600">
                  {race.roomError}
                </div>
              )}

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={copyInvite}
                  className="rounded-xl border border-[#e5e5e5] px-3 py-2 text-[12px] font-semibold text-[#111] transition-colors hover:border-[#111] hover:bg-[#fafafa]"
                >
                  {copied ? "초대 링크 복사됨" : "초대"}
                </button>
                {isHost ? (
                  <button
                    type="button"
                    onClick={onStart}
                    disabled={!room.canStart}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#f1f1f1] disabled:text-[#aaa]"
                  >
                    <Play size={14} />
                    시작하기
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => race.sendReady(!isReady)}
                    className={`rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors ${
                      isReady
                        ? "border border-[#e5e5e5] bg-[#fafafa] text-[#666] hover:border-[#ddd]"
                        : "bg-[#111] text-white hover:bg-[#333]"
                    }`}
                  >
                    {isReady ? "준비 취소" : "준비하기"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-3 xl:grid-cols-[minmax(260px,320px)_minmax(360px,420px)_minmax(0,1fr)] xl:items-start">
          <div className="contents">
            <section className="rounded-2xl border border-[#e5e5e5] bg-white p-3 xl:order-2">
              <h2 className="mb-3 text-[14px] font-bold">참여자</h2>
              <div className="grid grid-cols-2 gap-3">
                {participants.map((participant, index) => {
                  const character = participant
                    ? findCharacter(participant.characterId)
                    : null;

                  return (
                    <div
                      key={participant?.id ?? `empty-${index}`}
                      className="min-h-[148px] rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-2.5"
                    >
                      {participant && character ? (
                        <div className="flex h-full flex-col justify-between gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${participant.isReady ? "border border-[#d9ead3] bg-[#eef8ea] text-[#2f7d32]" : "border border-[#e5e5e5] bg-white text-[#999]"}`}
                            >
                              {participant.isReady ? "준비완료" : "대기중"}
                            </span>
                            {participant.role === "host" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b7791f]">
                                <Crown size={13} /> 방장
                              </span>
                            ) : null}
                          </div>
                          <div className="flex h-[72px] items-end justify-center overflow-hidden rounded-xl bg-white px-2 py-1">
                            <CharacterSprite
                              character={character}
                              maxHeight={68}
                              sequenceOverride={frameOverrides[character.id]}
                            />
                          </div>
                          <div className="min-w-0 text-center">
                            <p className="truncate text-[14px] font-semibold">
                              {participant.label}
                              {participant.id === me?.id ? " (나)" : ""}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#888]">
                              {character.label[settings.locale]}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[#ddd] bg-white text-[13px] font-semibold text-[#aaa]">
                          빈자리
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-[#e5e5e5] bg-white p-3 xl:order-1">
              <h2 className="mb-3 text-[14px] font-bold">방 설정</h2>
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-[12px] font-semibold text-[#666]">
                  공개 여부
                  {isHost ? (
                    <select
                      value={room.visibility}
                      onChange={(event) =>
                        sendSetting({
                          visibility: event.target
                            .value as TypingRoomVisibility,
                        })
                      }
                      className="h-9 rounded-lg border border-[#d7d7d7] px-2"
                    >
                      {Object.values(TYPING_ROOM_VISIBILITY).map((value) => (
                        <option key={value} value={value}>
                          {TYPING_ROOM_VISIBILITY_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2">
                      {TYPING_ROOM_VISIBILITY_LABELS[room.visibility]}
                    </p>
                  )}
                </label>

                <label className="grid gap-1 text-[12px] font-semibold text-[#666]">
                  최대 인원
                  {isHost ? (
                    <select
                      value={room.maxParticipants}
                      onChange={(event) =>
                        sendSetting({
                          maxParticipants: Number(event.target.value),
                        })
                      }
                      className="h-9 rounded-lg border border-[#d7d7d7] px-2"
                    >
                      {LOBBY_MAX_PARTICIPANT_OPTIONS.map((value) => (
                        <option
                          key={value}
                          value={value}
                          disabled={value < room.currentParticipants}
                        >
                          {value}명
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2">
                      최대 {room.maxParticipants}명
                    </p>
                  )}
                </label>

                <label className="grid gap-1 text-[12px] font-semibold text-[#666]">
                  언어
                  {isHost ? (
                    <select
                      value={room.language}
                      onChange={(event) =>
                        sendSetting({
                          language: event.target.value as TypingRoomLanguage,
                        })
                      }
                      className="h-9 rounded-lg border border-[#d7d7d7] px-2"
                    >
                      {[
                        TYPING_ROOM_LANGUAGE.KO,
                        TYPING_ROOM_LANGUAGE.EN,
                        TYPING_ROOM_LANGUAGE.CODE,
                      ].map((value) => (
                        <option key={value} value={value}>
                          {TYPING_ROOM_LANGUAGE_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2">
                      {TYPING_ROOM_LANGUAGE_LABELS[room.language]}
                    </p>
                  )}
                </label>

                <label className="grid gap-1 text-[12px] font-semibold text-[#666]">
                  문장 길이
                  {isHost ? (
                    <select
                      value={room.textType}
                      onChange={(event) =>
                        sendSetting({
                          textType: event.target.value as TypingRoomTextType,
                        })
                      }
                      className="h-9 rounded-lg border border-[#d7d7d7] px-2"
                    >
                      {Object.values(TYPING_ROOM_TEXT_TYPE).map((value) => (
                        <option key={value} value={value}>
                          {TYPING_ROOM_TEXT_TYPE_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2">
                      {TYPING_ROOM_TEXT_TYPE_LABELS[room.textType]}
                    </p>
                  )}
                </label>

                <label className="grid gap-1 text-[12px] font-semibold text-[#666]">
                  난이도
                  {isHost ? (
                    <select
                      value={room.difficulty}
                      onChange={(event) =>
                        sendSetting({
                          difficulty: event.target
                            .value as TypingRoomDifficulty,
                        })
                      }
                      className="h-9 rounded-lg border border-[#d7d7d7] px-2"
                    >
                      {Object.values(TYPING_ROOM_DIFFICULTY).map((value) => (
                        <option key={value} value={value}>
                          {TYPING_ROOM_DIFFICULTY_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2">
                      {TYPING_ROOM_DIFFICULTY_LABELS[room.difficulty]}
                    </p>
                  )}
                </label>

                <label className="grid gap-1 text-[12px] font-semibold text-[#666]">
                  판 수
                  {isHost ? (
                    <select
                      value={room.roundCount}
                      onChange={(event) =>
                        sendSetting({ roundCount: Number(event.target.value) })
                      }
                      className="h-9 rounded-lg border border-[#d7d7d7] px-2"
                    >
                      {LOBBY_ROUND_COUNT_OPTIONS.map((value) => (
                        <option key={value} value={value}>
                          {value}판
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2">
                      {room.roundCount}판
                    </p>
                  )}
                </label>

                <label className="grid gap-1 text-[12px] font-semibold text-[#666]">
                  진행 방식
                  {isHost ? (
                    <select
                      value={room.mode}
                      onChange={(event) =>
                        sendSetting({
                          mode: event.target.value as TypingRoomMode,
                        })
                      }
                      className="h-9 rounded-lg border border-[#d7d7d7] px-2"
                    >
                      {[
                        TYPING_ROOM_MODE.FINISH,
                        TYPING_ROOM_MODE.TIME_LIMIT,
                      ].map((value) => (
                        <option key={value} value={value}>
                          {TYPING_ROOM_MODE_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2">
                      {TYPING_ROOM_MODE_LABELS[room.mode]}
                    </p>
                  )}
                </label>

                {settingsError && (
                  <p className="col-span-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-600">
                    {settingsError}
                  </p>
                )}

                <label className="col-span-2 grid gap-1 text-[12px] font-semibold text-[#666]">
                  덱
                  {isHost ? (
                    <select
                      value={room.selectedDeckId ?? selectedDeck.id}
                      onChange={onDeckChange}
                      className="h-9 rounded-lg border border-[#d7d7d7] px-2"
                    >
                      {deckOptions.map((deck) => (
                        <option key={deck.id} value={deck.id}>
                          {normalizeDeckTitle(deck)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2">
                      {roomDeckTitle}
                    </p>
                  )}
                </label>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-[#e5e5e5] bg-white p-3 xl:order-3">
            <h2 className="mb-3 text-[14px] font-bold">채팅</h2>
            <div className="h-[260px] overflow-y-auto rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3 md:h-[320px] xl:h-[300px]">
              {!hasMessages && (
                <p className="text-[12px] leading-5 text-[#aaa]">
                  아직 메시지가 없습니다.
                </p>
              )}
              {messages.map((message) => (
                <div key={message.id} className="mb-2 text-[12px]">
                  {message.messageType === "system" ? (
                    <p className="text-[#999]">
                      <span className="font-semibold">[시스템]</span>{" "}
                      {message.content}
                    </p>
                  ) : (
                    <p>
                      <span className="font-semibold">
                        {message.senderLabel ?? "참가자"}:
                      </span>{" "}
                      {message.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={chatDraft}
                onChange={(event) => {
                  setChatDraft(event.target.value);
                  if (event.target.value.length > MAX_LOBBY_CHAT_LENGTH) {
                    setChatError(
                      `채팅은 최대 ${MAX_LOBBY_CHAT_LENGTH}자까지 보낼 수 있어요.`
                    );
                  } else {
                    setChatError(null);
                  }
                }}
                placeholder="메시지 입력"
                className="h-9 flex-1 rounded-lg border border-[#d7d7d7] px-3 text-[13px]"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    onChatSubmit();
                  }
                }}
              />
              <button
                type="button"
                onClick={onChatSubmit}
                disabled={!canSendChat}
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#111] px-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#ddd] disabled:text-[#999]"
              >
                <Send size={14} />
              </button>
            </div>
            {chatError && (
              <p className="mt-2 text-[12px] text-[#d33]">{chatError}</p>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
