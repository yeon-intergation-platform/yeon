"use client";

import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useCharacterFrameOverrides } from "./use-character-frame-overrides";
import { usePlayerIdentity } from "./use-player-identity";
import { useRaceRoom } from "./use-race-room";
import { useTypingProfile } from "./use-typing-profile";
import { TypingRaceMultiplayerScreen } from "./typing-race-multiplayer-screen";
import { TypingServiceHeader } from "./typing-service-header";
import { TypingRoomChatPanel } from "./typing-room-chat-panel";
import { TypingRoomParticipantsPanel } from "./typing-room-participants-panel";
import { TypingRoomSettingsPanel } from "./typing-room-settings-panel";
import { TypingRoomWaitingHeader } from "./typing-room-waiting-header";
import {
  TYPING_ROOM_DIFFICULTY_LABELS,
  TYPING_ROOM_LANGUAGE_LABELS,
  TYPING_ROOM_TEXT_TYPE_LABELS,
} from "./typing-room-labels";
import {
  resolveTypingRaceSeed,
  useSelectedTypingDeck,
  useTypingSettings,
  type TypingDeckOption,
  type TypingRaceSeed,
} from "./use-typing-settings";
import { normalizeDeckTitle } from "./typing-room-deck-format";
import { resolveTypingRoomSelectedDeck } from "./typing-room-selection";
import {
  TypingRoomConnectionErrorState,
  TypingRoomLoadingState,
  TypingRoomSeedErrorState,
} from "./typing-room-state-views";
import {
  LOBBY_MAX_PARTICIPANT_OPTIONS,
  LOBBY_ROUND_COUNT_OPTIONS,
  MAX_LOBBY_CHAT_LENGTH,
} from "./typing-room-options";
import { trackEvent } from "@/lib/analytics";
import { RoomVoiceCallPanel } from "@/features/room-voice-call/room-voice-call-panel";
import { useRoomVoiceCall } from "@/features/room-voice-call/use-room-voice-call";

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

type TerritoryLobbyPanelProps = {
  room: NonNullable<ReturnType<typeof useRaceRoom>["roomSnapshot"]>;
  participants: (
    | NonNullable<
        ReturnType<typeof useRaceRoom>["roomSnapshot"]
      >["participants"][number]
    | null
  )[];
  roomSummary: string;
  messages: NonNullable<
    ReturnType<typeof useRaceRoom>["roomSnapshot"]
  >["messages"];
  isReady: boolean;
  isLeavingRoom: boolean;
  territoryHref: string;
  onLeaveRoom: () => void;
  onToggleReady: () => void;
};

function TerritoryLobbyPanel({
  room,
  participants,
  roomSummary,
  messages,
  isReady,
  isLeavingRoom,
  territoryHref,
  onLeaveRoom,
  onToggleReady,
}: TerritoryLobbyPanelProps) {
  const firstTeam = participants.filter((_, index) => index % 2 === 0);
  const secondTeam = participants.filter((_, index) => index % 2 === 1);
  const recentMessages = messages.slice(-4);
  const roomInfo = [
    ["방 이름", room.title],
    ["게임 타입", "팀 점령전"],
    ["게임 시간", "1분"],
    ["보너스 게임", "ON"],
    ["현재 인원", `${room.currentParticipants}/${room.maxParticipants}`],
  ];

  return (
    <section className="overflow-hidden rounded-[30px] border border-[#e5e5e5] bg-white p-3 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="grid gap-3">
          <div className="rounded-[22px] border border-[#e5e5e5] bg-white p-3">
            <h2 className="text-center text-[22px] font-black tracking-[-0.05em] text-[#111]">
              {room.title}
            </h2>
            <div className="mt-3 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-3 text-[#111]">
              {roomInfo.map(([label, value]) => (
                <div
                  key={label}
                  className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] rounded-xl bg-white px-3 py-2 text-[14px] font-black last:mb-0"
                >
                  <span className="text-[#666]">• {label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-[#e5e5e5] bg-white p-3">
            <h3 className="text-center text-[20px] font-black tracking-[-0.05em] text-[#111]">
              이모티콘 표시
            </h3>
            <div className="mt-2 grid grid-cols-4 gap-2 rounded-2xl bg-[#fafafa] p-3 text-center text-[28px]">
              {[
                ["😁", "웃음"],
                ["😴", "졸림"],
                ["😡", "화남"],
                ["😎", "준비"],
              ].map(([emoji, label]) => (
                <div key={label} className="rounded-xl bg-white p-2">
                  <div>{emoji}</div>
                  <p className="mt-1 text-[11px] font-black text-[#666]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] bg-[#111] px-4 py-3 text-center text-[16px] font-black text-white">
            💬 채팅 하기
          </div>

          <div className="rounded-[18px] border border-[#e5e5e5] bg-white p-3">
            <h3 className="flex items-center justify-between text-[18px] font-black text-[#111]">
              상세보기 <span>⌃</span>
            </h3>
            <div className="mt-2 max-h-24 overflow-hidden rounded-xl bg-[#fafafa] p-2 text-[12px] font-bold leading-5 text-[#666]">
              {recentMessages.length ? (
                recentMessages.map((message) => (
                  <p key={message.id} className="truncate">
                    [{message.senderLabel ?? "시스템"}] {message.content}
                  </p>
                ))
              ) : (
                <>
                  <p>[시스템] 점령전 대기방에 입장했습니다.</p>
                  <p>[시스템] 팀을 정하고 준비를 눌러 주세요.</p>
                </>
              )}
            </div>
          </div>
        </aside>

        <div className="overflow-hidden rounded-[24px] border border-[#e5e5e5] bg-white">
          <div className="grid grid-cols-[160px_minmax(0,1fr)] border-b border-[#e5e5e5] bg-[#111] text-white">
            <div className="px-6 py-4 text-[22px] font-black">대기방</div>
            <div className="px-6 py-4 text-[22px] font-black">준비</div>
          </div>

          <div className="grid min-h-[520px] grid-cols-[minmax(0,1fr)_34px_minmax(0,1fr)] gap-3 bg-[#fafafa] p-4">
            <TerritoryTeamColumn title="1팀" members={firstTeam} maxSlots={5} />
            <div className="flex flex-col items-center justify-center gap-8 text-3xl font-black text-[#aaa]">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index}>◆</span>
              ))}
            </div>
            <TerritoryTeamColumn
              title="파랑팀"
              members={secondTeam}
              maxSlots={5}
            />
          </div>

          <div className="grid gap-3 border-t border-[#e5e5e5] bg-white p-4 md:grid-cols-[180px_minmax(0,1fr)_180px_220px]">
            <button
              type="button"
              onClick={onLeaveRoom}
              disabled={isLeavingRoom}
              className="rounded-[22px] border border-[#e5e5e5] bg-white px-5 py-4 text-[18px] font-black text-[#111] disabled:opacity-50"
            >
              {isLeavingRoom ? "나가는 중" : "방 나가기"}
            </button>
            <p className="flex items-center justify-center rounded-[22px] bg-[#fafafa] px-4 py-3 text-center text-[13px] font-bold leading-5 text-[#666]">
              {roomSummary}
            </p>
            <button
              type="button"
              className="rounded-[22px] bg-[#111] px-5 py-4 text-[18px] font-black text-white"
            >
              팀 이동
            </button>
            <button
              type="button"
              onClick={onToggleReady}
              className={`rounded-[22px] px-5 py-4 text-[18px] font-black ${
                isReady
                  ? "border border-[#e5e5e5] bg-white text-[#111]"
                  : "bg-[#111] text-white"
              }`}
            >
              {isReady ? "준비 해제" : "준비하기"}
            </button>
          </div>

          <div className="border-t border-[#e5e5e5] bg-white p-4">
            <a
              href={territoryHref}
              className="block rounded-[22px] bg-[#111] px-6 py-4 text-center text-[20px] font-black text-white transition-opacity hover:opacity-90"
            >
              점령전 입장
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

type TerritoryTeamColumnProps = {
  title: string;
  members: (
    | NonNullable<
        ReturnType<typeof useRaceRoom>["roomSnapshot"]
      >["participants"][number]
    | null
  )[];
  maxSlots: number;
};

function TerritoryTeamColumn({
  title,
  members,
  maxSlots,
}: TerritoryTeamColumnProps) {
  const slots = Array.from(
    { length: maxSlots },
    (_, index) => members[index] ?? null
  );

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3 rounded-t-2xl border border-[#e5e5e5] bg-white px-4 py-3 text-[#111]">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fafafa] text-[24px]">
          🏴‍☠️
        </span>
        <h3 className="text-[24px] font-black tracking-[-0.05em]">{title}</h3>
      </div>
      <div className="grid gap-2 border-x border-b border-[#e5e5e5] bg-white p-3">
        {slots.map((member, index) => {
          const isLocked = index >= 5;
          return (
            <div
              key={member?.id ?? `${title}-${index}`}
              className={`grid min-h-14 grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 py-2 ${
                member
                  ? "border-[#111] bg-[#fafafa]"
                  : "border-[#e5e5e5] bg-white"
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[22px] shadow-sm">
                {member ? "🙂" : isLocked ? "🔒" : "+"}
              </span>
              <span className="truncate text-[15px] font-black text-[#111]">
                {member?.label ?? (isLocked ? "잠김" : "빈 자리")}
              </span>
              {member ? (
                <span className="text-[13px] font-black text-[#666]">
                  {member.role === "host"
                    ? "방장"
                    : member.isReady
                      ? "준비 완료 ✓"
                      : "준비 중 …"}
                </span>
              ) : (
                <span className="text-[20px] font-black text-[#aaa]">+</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  const voiceParticipants = useMemo(
    () =>
      (room?.participants ?? []).map((participant) => ({
        id: participant.id,
        label: participant.label,
      })),
    [room?.participants]
  );
  const voiceCall = useRoomVoiceCall({
    room: race.room,
    localParticipantId: race.mySeat,
    participants: voiceParticipants,
  });
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

  const onChatDraftChange = useCallback((value: string) => {
    setChatDraft(value);
    if (value.length > MAX_LOBBY_CHAT_LENGTH) {
      setChatError(
        `채팅은 최대 ${MAX_LOBBY_CHAT_LENGTH}자까지 보낼 수 있어요.`
      );
      return;
    }
    setChatError(null);
  }, []);

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

      if (destination.pathname === "/typing-service/territory" && race.roomId) {
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
  const waitingStateLabel =
    room?.status === TYPING_ROOM_STATUS.WAITING ? "대기중" : room?.status;

  if (mode === "create" && seedState.kind === "loading") {
    return (
      <TypingRoomLoadingState message="선택한 덱에서 레이스 문장을 준비하는 중..." />
    );
  }

  if (mode === "create" && seedState.kind === "error") {
    return (
      <TypingRoomSeedErrorState
        message={seedState.message}
        onRetry={() => setSeedRetryToken((value) => value + 1)}
        onUseDefaultDeck={() => setUseDefaultFallback(true)}
      />
    );
  }

  if (race.connectionState === "connecting" || !room) {
    return (
      <TypingRoomLoadingState
        message={
          mode === "create"
            ? "타자방을 만드는 중..."
            : "타자방에 입장하는 중..."
        }
      />
    );
  }

  if (
    race.connectionState === "error" ||
    race.connectionState === "disconnected"
  ) {
    return (
      <TypingRoomConnectionErrorState
        message={
          race.roomError ??
          "방이 이미 시작되었거나 서버 연결이 끊겼을 수 있어요."
        }
      />
    );
  }

  if (room.status !== TYPING_ROOM_STATUS.WAITING) {
    return <TypingRaceMultiplayerScreen race={race} voiceCall={voiceCall} />;
  }

  return (
    <div
      className={SHARED_FEATURE_CLASS.pageSurface}
      onClickCapture={onRoomNavigationClickCapture}
    >
      <TypingServiceHeader active="rooms" title="타자방" />

      <main className="grid gap-3 px-4 py-3 md:px-8 md:py-4">
        <TypingRoomWaitingHeader
          room={room}
          roomSummary={roomSummary}
          waitingStateLabel={waitingStateLabel ?? "대기중"}
          copyError={copyError}
          copied={copied}
          isHost={isHost}
          isReady={isReady}
          isLeavingRoom={isLeavingRoom}
          roomError={race.roomError}
          territoryHref={`/typing-service/territory?roomId=${encodeURIComponent(
            race.roomId ?? room.roomId
          )}`}
          onLeaveRoom={onLeaveRoom}
          onCopyInvite={copyInvite}
          onStart={onStart}
          onToggleReady={() => race.sendReady(!isReady)}
        />

        <TerritoryLobbyPanel
          room={room}
          participants={participants}
          roomSummary={roomSummary}
          messages={messages}
          isReady={isReady}
          isLeavingRoom={isLeavingRoom}
          territoryHref={`/typing-service/territory?roomId=${encodeURIComponent(
            race.roomId ?? room.roomId
          )}`}
          onLeaveRoom={onLeaveRoom}
          onToggleReady={() => race.sendReady(!isReady)}
        />

        <section className="grid gap-3 xl:grid-cols-[minmax(260px,320px)_minmax(360px,420px)_minmax(0,1fr)] xl:items-start">
          <div className="grid gap-3 xl:order-2">
            <TypingRoomParticipantsPanel
              participants={participants}
              myParticipantId={me?.id ?? null}
              locale={settings.locale}
              frameOverrides={frameOverrides}
            />
            <RoomVoiceCallPanel voiceCall={voiceCall} />
          </div>

          <TypingRoomSettingsPanel
            room={room}
            isHost={isHost}
            selectedDeckId={selectedDeck.id}
            roomDeckTitle={roomDeckTitle}
            deckOptions={deckOptions}
            settingsError={settingsError}
            onSendSetting={sendSetting}
            onDeckChange={onDeckChange}
          />

          <TypingRoomChatPanel
            messages={messages}
            chatDraft={chatDraft}
            chatError={chatError}
            canSendChat={canSendChat}
            onChatDraftChange={onChatDraftChange}
            onChatSubmit={onChatSubmit}
          />
        </section>
      </main>
    </div>
  );
}
