import {
  RACE_EVENTS,
  VOICE_EVENTS,
  TYPING_DECK_LANGUAGE_TAG,
  TYPING_DECK_VISIBILITY,
  TYPING_RACE_DEFAULTS,
  TYPING_RACE_LANE_ACCENTS,
  TYPING_RACE_LANE_ROLE,
  TYPING_RACE_STAGE,
  TYPING_SPEED_STYLE,
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_LANGUAGE,
  TYPING_ROOM_LIFECYCLE,
  TYPING_ROOM_MODE,
  TYPING_ROOM_STATUS,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  calculateTypingScore,
  clampPercent,
  clampRaceProgress,
  countTypingMetricUnits,
  getTypingDisplayUnit,
  normalizeNonNegativeInteger,
  rankTypingResults,
  resolveTypingSpeedStyle,
  toWpmFromCpm,
  type MatchJoinMessage,
  type RoomChatMessage,
  type RoomSettingsUpdateMessage,
  type RoomStartMessage,
  type RaceFinishMessage,
  type RaceProgressMessage,
  type RaceSeedMessage,
  type RoomReadyMessage,
  type VoiceAnswerMessage,
  type VoiceEndMessage,
  type VoiceIceCandidateLike,
  type VoiceIceCandidateMessage,
  type VoiceMuteToggleMessage,
  type VoiceOfferMessage,
  type TypingRaceLaneSnapshot,
  type TypingDeckLanguageTag,
  type TypingDeckVisibility,
  type TypingRaceSnapshot,
  type TypingRaceStage,
  type TypingResultSnapshot,
  type TypingRoomCreateMessage,
  type TypingRoomLanguage,
  type TypingRoomLifecycle,
  type TypingRoomMode,
  type TypingRoomTextType,
  type TypingRoomDifficulty,
  type TypingRoomVisibility,
  type TypingRoomParticipantSnapshot,
  type TypingRoomChatMessage,
  type TypingRoomSettings,
  type TypingRoomSnapshot,
  type TypingRoomStatus,
  type TypingRoomSummary,
} from "@yeon/race-shared";
import { type Client, Room } from "@colyseus/core";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

type ClockTimer = { clear: () => void };
type JsonObject = Record<string, unknown>;
type VoiceSession = {
  participants: Set<string>;
  timeout: ClockTimer | null;
};

const VOICE_SESSION_TIMEOUT_MS = 30_000;

type RoomParticipant = {
  id: string;
  label: string;
  characterId?: string;
  accent: string;
  kind: "player" | "benchmark";
  progress: number;
  cpm: number;
  wpm: number;
  accuracy: number;
  mistakeCount: number;
  elapsedTimeMs: number;
  finishedAt: number | null;
  score: number;
  rank: number | null;
  isReady: boolean;
  joinedAt: number;
  // 검증된 로그인 userId. options.userId + options.userToken 이 HMAC 검증을 통과할 때만 저장.
  // 토큰 없음/위조 → null → 경험치 적립 대상에서 제외(익명/게스트도 null).
  verifiedUserId: string | null;
};

const DEMO_PROMPT_OPTIONS: Record<
  TypingRoomLanguage,
  readonly { id: string; title: string; prompt: string }[]
> = {
  ko: [
    {
      id: "fallback-ko-countdown",
      title: "카운트다운",
      prompt:
        "열 초 카운트다운이 끝나면 눈보다 손이 먼저 나가지 않게 문장을 끝까지 밀어 보세요.",
    },
    {
      id: "fallback-ko-rhythm",
      title: "리듬 유지",
      prompt:
        "빠른 손보다 안정적인 리듬이 먼저입니다. 다음 단어를 미리 읽고 손끝은 차분하게 따라가 보세요.",
    },
    {
      id: "fallback-ko-focus",
      title: "집중 흐름",
      prompt:
        "한 글자씩 정확하게 지나가면 긴 문장도 부담이 줄어듭니다. 속도는 흐름이 잡힌 뒤에 자연스럽게 올라갑니다.",
    },
  ],
  en: [
    {
      id: "fallback-en-countdown",
      title: "Countdown",
      prompt:
        "Once the countdown ends, let your fingers move forward through the sentence with a steady rhythm.",
    },
    {
      id: "fallback-en-rhythm",
      title: "Steady rhythm",
      prompt:
        "Accuracy comes first, then speed follows. Read the next word early and keep your hands moving calmly.",
    },
    {
      id: "fallback-en-focus",
      title: "Focus flow",
      prompt:
        "A clean typing flow starts with small choices. Keep your eyes ahead and let every key press land with intent.",
    },
  ],
  code: [
    {
      id: "fallback-code-trim",
      title: "Trim check",
      prompt: "function typeRace(input) { return input.trim().length > 0; }",
    },
    {
      id: "fallback-code-map",
      title: "Map labels",
      prompt: "const labels = users.map((user) => user.name).filter(Boolean);",
    },
    {
      id: "fallback-code-guard",
      title: "Guard clause",
      prompt: "if (!room || room.status !== 'waiting') return null;",
    },
  ],
};

const LOCAL_DEFAULT_DECK_ID_PREFIX = "local-default";
const DEFAULT_DECK_TITLE = "기본 덱";
const PRIVATE_DECK_LOBBY_TITLE = "비공개 덱";
const MAX_SEED_PROMPT_LENGTH = 4000;
const MAX_SEED_ID_LENGTH = 120;
const MAX_SEED_LABEL_LENGTH = 120;
const MAX_REASONABLE_CPM = 1200;
const MAX_CHAT_MESSAGE_LENGTH = 500;
const MAX_LOBBY_CHAT_MESSAGES = 100;
const LOBBY_RECONNECT_GRACE_MS = 30_000;
const LOBBY_RETURN_DELAY_MS = 4_500;
const TYPING_RACE_SEED_FALLBACK_SECRET = "yeon-local-typing-race-seed-secret";
const LOBBY_MAX_PARTICIPANTS_OPTIONS = [2, 3, 4] as const;
const LOBBY_ROUND_COUNT_OPTIONS = [1, 3, 5] as const;

const BENCHMARKS = [
  {
    id: "benchmark-1",
    label: "Guest",
    accent: TYPING_RACE_LANE_ACCENTS[1],
    cpm: 265,
  },
  {
    id: "benchmark-2",
    label: "Guest",
    accent: TYPING_RACE_LANE_ACCENTS[2],
    cpm: 241,
  },
  {
    id: "benchmark-3",
    label: "Guest",
    accent: TYPING_RACE_LANE_ACCENTS[3],
    cpm: 227,
  },
] as const;

const DEFAULT_ROOM_SETTINGS: TypingRoomSettings = {
  title: "한글 짧은 문장 같이 치기",
  visibility: TYPING_ROOM_VISIBILITY.PUBLIC,
  maxParticipants: TYPING_RACE_DEFAULTS.lobbyMaxPlayers,
  textType: TYPING_ROOM_TEXT_TYPE.SHORT,
  language: TYPING_ROOM_LANGUAGE.KO,
  difficulty: TYPING_ROOM_DIFFICULTY.NORMAL,
  roundCount: 1,
  mode: TYPING_ROOM_MODE.FINISH,
};

// 엔진 레인 수가 4개라 maxClients도 4로 제한 (LANE_Y_RATIOS 길이와 일치시켜 5번째 참여자 누락 방지)
const MAX_PLAYERS_PER_ROOM = TYPING_RACE_DEFAULTS.lobbyMaxPlayers;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseVoiceBase(
  payload: unknown
): Pick<VoiceOfferMessage, "sessionId" | "targetParticipantId"> | null {
  const obj = payload as JsonObject | null;
  if (!obj) return null;
  if (
    !isNonEmptyString(obj.sessionId) ||
    !isNonEmptyString(obj.targetParticipantId)
  ) {
    return null;
  }

  return {
    sessionId: obj.sessionId.trim(),
    targetParticipantId: obj.targetParticipantId.trim(),
  };
}

function parseVoiceOffer(
  payload: unknown
): Pick<VoiceOfferMessage, "sessionId" | "targetParticipantId" | "sdp"> | null {
  const base = parseVoiceBase(payload);
  if (!base) return null;
  const obj = payload as JsonObject;
  if (typeof obj.sdp !== "string" || !obj.sdp.trim()) {
    return null;
  }

  return {
    ...base,
    sdp: obj.sdp,
  };
}

function parseVoiceAnswer(
  payload: unknown
): Pick<
  VoiceAnswerMessage,
  "sessionId" | "targetParticipantId" | "sdp"
> | null {
  return parseVoiceOffer(payload);
}

function parseVoiceCandidate(
  payload: unknown
): Pick<
  VoiceIceCandidateMessage,
  "sessionId" | "targetParticipantId" | "candidate"
> | null {
  const base = parseVoiceBase(payload);
  if (!base) return null;

  const candidateObj = (payload as JsonObject | null)?.candidate;
  if (!candidateObj || typeof candidateObj !== "object") {
    return null;
  }

  if (!isNonEmptyString((candidateObj as JsonObject).candidate)) {
    return null;
  }

  return {
    ...base,
    candidate: {
      candidate: (candidateObj as JsonObject).candidate as string,
      sdpMid:
        typeof (candidateObj as JsonObject).sdpMid === "string"
          ? ((candidateObj as JsonObject).sdpMid as string)
          : null,
      sdpMLineIndex:
        typeof (candidateObj as JsonObject).sdpMLineIndex === "number"
          ? ((candidateObj as JsonObject).sdpMLineIndex as number)
          : null,
      usernameFragment:
        typeof (candidateObj as JsonObject).usernameFragment === "string"
          ? ((candidateObj as JsonObject).usernameFragment as string)
          : null,
    },
  };
}

function parseVoiceEnd(
  payload: unknown
): Pick<
  VoiceEndMessage,
  "sessionId" | "targetParticipantId" | "reason"
> | null {
  const base = parseVoiceBase(payload);
  if (!base) return null;

  const reason = (payload as JsonObject | null)?.reason;
  return {
    ...base,
    reason:
      reason === "hangup" ||
      reason === "timeout" ||
      reason === "rejected" ||
      reason === "error" ||
      reason === "network"
        ? reason
        : undefined,
  };
}

function parseVoiceMute(
  payload: unknown
): Pick<
  VoiceMuteToggleMessage,
  "sessionId" | "targetParticipantId" | "muted"
> | null {
  const base = parseVoiceBase(payload);
  if (!base) return null;
  const muted = (payload as JsonObject | null)?.muted;
  if (typeof muted !== "boolean") {
    return null;
  }

  return {
    ...base,
    muted,
  };
}

function clampOption(
  value: number | undefined,
  allowed: readonly number[],
  fallback: number
) {
  if (!value) return fallback;
  return allowed.includes(value) ? value : fallback;
}

function clampText(
  value: string | undefined,
  fallback: string,
  maxLength: number
) {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLength);
}

function optionalText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim().slice(0, maxLength)
    : undefined;
}

function normalizeDeckVisibility(
  value: unknown
): TypingDeckVisibility | undefined {
  return Object.values(TYPING_DECK_VISIBILITY).includes(
    value as TypingDeckVisibility
  )
    ? (value as TypingDeckVisibility)
    : undefined;
}

function normalizeDeckLanguageTag(
  value: unknown
): TypingDeckLanguageTag | undefined {
  return Object.values(TYPING_DECK_LANGUAGE_TAG).includes(
    value as TypingDeckLanguageTag
  )
    ? (value as TypingDeckLanguageTag)
    : undefined;
}

function getTypingRaceSeedSigningSecret() {
  return (
    process.env.TYPING_RACE_SEED_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    TYPING_RACE_SEED_FALLBACK_SECRET
  );
}

function raceSeedSigningPayload(seed: RaceSeedMessage) {
  return JSON.stringify({
    passageId: seed.passageId,
    prompt: seed.prompt,
    roundLabel: seed.roundLabel,
    deckId: seed.deckId,
    deckVisibility: seed.deckVisibility,
    lobbyDeckTitle: seed.lobbyDeckTitle,
    participantDeckTitle: seed.participantDeckTitle,
    languageTag: seed.languageTag,
  });
}

// 로그인 사용자 토큰 검증: 웹 BFF(signTypingRaceUserToken)와 바이트 동일하게 계산해 비교한다.
// - 동일 시크릿(getTypingRaceSeedSigningSecret: TYPING_RACE_SEED_SECRET → AUTH_SECRET → 로컬 fallback).
// - payload prefix "typing-race-user." + userId, base64url, "u1." prefix.
// - timing-safe 비교(카드방 토큰 패턴과 동일).
// 토큰 없음/형식 불일치/계산 불일치 → false(신뢰 안 함 → 적립 없음).
const TYPING_RACE_USER_TOKEN_PREFIX = "typing-race-user.";

function verifyTypingRaceUserToken(
  userId: string | undefined | null,
  token: string | undefined | null
): boolean {
  if (typeof userId !== "string" || userId.length === 0) {
    return false;
  }
  if (typeof token !== "string" || !token.startsWith("u1.")) {
    return false;
  }
  const expected = createHmac("sha256", getTypingRaceSeedSigningSecret())
    .update(`${TYPING_RACE_USER_TOKEN_PREFIX}${userId}`)
    .digest("base64url");
  const actual = token.slice(3);
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function verifyRaceSeedToken(seed: RaceSeedMessage) {
  const token = optionalText(seed.seedToken, 256);
  if (!token?.startsWith("v1.")) {
    return false;
  }

  const expected = createHmac("sha256", getTypingRaceSeedSigningSecret())
    .update(raceSeedSigningPayload(seed))
    .digest("base64url");
  const actual = token.slice(3);
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function createRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const DEFAULT_BACKEND_BASE_URL = "http://localhost:8080";
const TYPING_RACE_FINISHED_ACTIVITY = "typing_race_finished";

function backendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ||
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

function springInternalHeaders() {
  const headers: Record<string, string> = {
    accept: "application/json",
    "content-type": "application/json",
  };
  const token = process.env.SPRING_INTERNAL_TOKEN?.trim();
  if (token) headers["X-Yeon-Internal-Token"] = token;
  return headers;
}

// 타자 레이스 완료 시 로그인 참가자에게 경험치를 적립하도록 Spring 내부 엔드포인트를 호출한다.
// best-effort: 호출 실패가 레이스 진행/결과를 깨지 않게 호출부에서 await 하지 않고 예외를 삼킨다.
// referenceId 는 (레이스 roomId + userId) 라 멱등이다 — 같은 레이스로 유저당 1회만 적립된다.
async function awardTypingRaceFinished(userId: string, raceId: string) {
  try {
    const response = await fetch(
      `${backendBaseUrl()}/api/v1/internal/experience/award`,
      {
        method: "POST",
        headers: springInternalHeaders(),
        body: JSON.stringify({
          userId,
          activityType: TYPING_RACE_FINISHED_ACTIVITY,
          referenceId: `${raceId}#${userId}`,
        }),
      }
    );
    if (!response.ok) {
      console.warn(
        `타자 레이스 완료 경험치 적립 응답이 실패했습니다(레이스 진행은 정상). status=${response.status}`
      );
    }
  } catch (error) {
    console.warn(
      "타자 레이스 완료 경험치 적립 호출에 실패했습니다(레이스 진행은 정상).",
      error
    );
  }
}

function normalizeSettings(
  options?: TypingRoomCreateMessage
): TypingRoomSettings {
  const visibility = Object.values(TYPING_ROOM_VISIBILITY).includes(
    options?.visibility as TypingRoomVisibility
  )
    ? (options?.visibility as TypingRoomVisibility)
    : DEFAULT_ROOM_SETTINGS.visibility;

  const textType = Object.values(TYPING_ROOM_TEXT_TYPE).includes(
    options?.textType as TypingRoomTextType
  )
    ? (options?.textType as TypingRoomTextType)
    : DEFAULT_ROOM_SETTINGS.textType;

  const difficulty = Object.values(TYPING_ROOM_DIFFICULTY).includes(
    options?.difficulty as TypingRoomDifficulty
  )
    ? (options?.difficulty as TypingRoomDifficulty)
    : DEFAULT_ROOM_SETTINGS.difficulty;

  const roundCount = clampOption(
    options?.roundCount,
    [...LOBBY_ROUND_COUNT_OPTIONS],
    DEFAULT_ROOM_SETTINGS.roundCount
  );

  const mode = Object.values(TYPING_ROOM_MODE).includes(
    options?.mode as TypingRoomMode
  )
    ? (options?.mode as TypingRoomMode)
    : DEFAULT_ROOM_SETTINGS.mode;

  const maxParticipants = Math.min(
    MAX_PLAYERS_PER_ROOM,
    clampOption(
      options?.maxParticipants,
      [...LOBBY_MAX_PARTICIPANTS_OPTIONS],
      DEFAULT_ROOM_SETTINGS.maxParticipants
    )
  );

  const language = Object.values(TYPING_ROOM_LANGUAGE).includes(
    options?.language as TypingRoomLanguage
  )
    ? (options?.language as TypingRoomLanguage)
    : options?.locale === "en"
      ? TYPING_ROOM_LANGUAGE.EN
      : DEFAULT_ROOM_SETTINGS.language;

  const seedVisibility = normalizeDeckVisibility(
    options?.raceSeed?.deckVisibility
  );
  const selectedDeckVisibility =
    normalizeDeckVisibility(options?.selectedDeckVisibility) ?? seedVisibility;
  const selectedDeckLanguageTag =
    normalizeDeckLanguageTag(options?.selectedDeckLanguageTag) ??
    normalizeDeckLanguageTag(options?.raceSeed?.languageTag);
  const selectedDeckId =
    optionalText(options?.selectedDeckId, MAX_SEED_ID_LENGTH) ??
    optionalText(options?.raceSeed?.deckId, MAX_SEED_ID_LENGTH);
  const seedLobbyTitle = optionalText(
    options?.raceSeed?.lobbyDeckTitle,
    MAX_SEED_LABEL_LENGTH
  );
  const suppliedLobbyTitle =
    optionalText(options?.lobbyDeckTitle, MAX_SEED_LABEL_LENGTH) ??
    seedLobbyTitle;

  return {
    title: clampText(options?.title, DEFAULT_ROOM_SETTINGS.title, 40),
    visibility,
    maxParticipants,
    textType,
    language,
    difficulty,
    roundCount,
    mode,
    selectedDeckId,
    selectedDeckVisibility,
    selectedDeckLanguageTag,
    lobbyDeckTitle:
      selectedDeckVisibility === TYPING_DECK_VISIBILITY.PRIVATE
        ? PRIVATE_DECK_LOBBY_TITLE
        : suppliedLobbyTitle,
  };
}

function createFallbackRaceSeed(language: TypingRoomLanguage): RaceSeedMessage {
  const options = DEMO_PROMPT_OPTIONS[language] ?? DEMO_PROMPT_OPTIONS.ko;
  const passage = options[randomInt(options.length)] ?? options[0]!;
  return {
    passageId: passage.id,
    prompt: passage.prompt,
    roundLabel: passage.title,
    deckVisibility: TYPING_DECK_VISIBILITY.DEFAULT,
    lobbyDeckTitle: DEFAULT_DECK_TITLE,
    participantDeckTitle: DEFAULT_DECK_TITLE,
    languageTag:
      language === TYPING_ROOM_LANGUAGE.EN
        ? TYPING_DECK_LANGUAGE_TAG.EN
        : TYPING_DECK_LANGUAGE_TAG.KO,
  };
}

function isTrustedUnsignedDefaultSeed(seed: RaceSeedMessage) {
  return (
    !seed.seedToken &&
    seed.deckVisibility === TYPING_DECK_VISIBILITY.DEFAULT &&
    typeof seed.deckId === "string" &&
    seed.deckId.startsWith(`${LOCAL_DEFAULT_DECK_ID_PREFIX}-`)
  );
}

function normalizeRaceSeed(
  suppliedSeed: TypingRoomCreateMessage["raceSeed"] | undefined,
  language: TypingRoomLanguage
): RaceSeedMessage {
  const fallback = createFallbackRaceSeed(language);
  const prompt = optionalText(suppliedSeed?.prompt, MAX_SEED_PROMPT_LENGTH);

  if (!prompt) {
    return fallback;
  }

  const deckVisibility =
    normalizeDeckVisibility(suppliedSeed?.deckVisibility) ??
    fallback.deckVisibility;
  if (deckVisibility === TYPING_DECK_VISIBILITY.PRIVATE) {
    return fallback;
  }

  const participantDeckTitle =
    optionalText(suppliedSeed?.participantDeckTitle, MAX_SEED_LABEL_LENGTH) ??
    optionalText(suppliedSeed?.lobbyDeckTitle, MAX_SEED_LABEL_LENGTH);
  const lobbyDeckTitle =
    optionalText(suppliedSeed?.lobbyDeckTitle, MAX_SEED_LABEL_LENGTH) ??
    participantDeckTitle;

  const seed: RaceSeedMessage = {
    passageId:
      optionalText(suppliedSeed?.passageId, MAX_SEED_ID_LENGTH) ??
      fallback.passageId,
    prompt,
    roundLabel:
      optionalText(suppliedSeed?.roundLabel, MAX_SEED_LABEL_LENGTH) ??
      fallback.roundLabel,
    seedToken: optionalText(suppliedSeed?.seedToken, 256),
    deckId: optionalText(suppliedSeed?.deckId, MAX_SEED_ID_LENGTH),
    deckVisibility,
    lobbyDeckTitle,
    participantDeckTitle,
    languageTag:
      normalizeDeckLanguageTag(suppliedSeed?.languageTag) ??
      fallback.languageTag,
  };

  return verifyRaceSeedToken(seed) || isTrustedUnsignedDefaultSeed(seed)
    ? seed
    : fallback;
}

export class TypingRaceRoom extends Room {
  maxClients: number = MAX_PLAYERS_PER_ROOM;

  private readonly participants = new Map<string, RoomParticipant>();
  private readonly participantToVoiceSession = new Map<string, string>();
  private readonly voiceSessions = new Map<string, VoiceSession>();

  private readonly clientParticipantIds = new Map<string, string>();

  private readonly explicitLeavingClientIds = new Set<string>();

  private readonly participantCleanupTimers = new Map<
    string,
    { clear: () => void }
  >();

  private readonly benchmarks = new Map<string, RoomParticipant>();

  private settings: TypingRoomSettings = DEFAULT_ROOM_SETTINGS;

  private readonly lobbyMessages: TypingRoomChatMessage[] = [];

  private roomSeed: RaceSeedMessage = createFallbackRaceSeed(
    DEFAULT_ROOM_SETTINGS.language
  );

  private status: TypingRoomStatus = TYPING_ROOM_STATUS.COUNTDOWN;

  private lifecycle: TypingRoomLifecycle = TYPING_ROOM_LIFECYCLE.ACTIVE;

  private stage: TypingRaceStage = TYPING_RACE_STAGE.COUNTDOWN;

  private countdownRemaining: number = TYPING_RACE_DEFAULTS.countdownSeconds;

  private startedAt: number = Date.now();

  private countdownAccumulator: number = 0;

  private hostId: string | null = null;

  private roomCode: string = createRoomCode();

  private createdAt: number = Date.now();

  private lobbyMode: boolean = false;

  private lobbyReturnTimer: { clear: () => void } | null = null;

  private get speedStyle() {
    return resolveTypingSpeedStyle(
      this.roomSeed.languageTag ?? this.settings.language
    );
  }

  onCreate(options?: TypingRoomCreateMessage) {
    this.lobbyMode = options?.roomMode === "lobby";
    this.autoDispose = !this.lobbyMode;
    this.settings = normalizeSettings(options);
    this.roomSeed = normalizeRaceSeed(
      options?.raceSeed,
      this.settings.language
    );
    this.settings = this.applyRoomSeedMetadata(this.settings, this.roomSeed);
    this.maxClients = this.settings.maxParticipants;
    this.status = this.lobbyMode
      ? TYPING_ROOM_STATUS.WAITING
      : TYPING_ROOM_STATUS.COUNTDOWN;
    this.countdownRemaining = this.lobbyMode
      ? TYPING_RACE_DEFAULTS.roomCountdownSeconds
      : TYPING_RACE_DEFAULTS.countdownSeconds;
    this.createdAt = Date.now();
    this.setMetadata(this.createSummary());

    if (!this.lobbyMode) {
      this.resetRaceClock(TYPING_RACE_DEFAULTS.countdownSeconds);
      this.bootstrapBenchmarks();
    }

    this.appendSystemMessage("방이 생성되었습니다.");

    this.onMessage(RACE_EVENTS.ROOM_READY, (client, message) => {
      this.updateReady(client, message as RoomReadyMessage);
    });

    this.onMessage(RACE_EVENTS.ROOM_SETTINGS, (client, message) => {
      this.updateSettings(client, message as RoomSettingsUpdateMessage);
    });

    this.onMessage(RACE_EVENTS.ROOM_CHAT, (client, message) => {
      this.addChat(client, message as RoomChatMessage);
    });

    this.onMessage(RACE_EVENTS.ROOM_LEAVE, (client) => {
      this.leaveExplicitly(client);
    });

    this.onMessage(RACE_EVENTS.ROOM_START, (client, message) => {
      this.startFromLobby(client, message as RoomStartMessage | undefined);
    });

    this.onMessage(RACE_EVENTS.RACE_PROGRESS, (client, message) => {
      this.updateParticipantProgress(client, message as RaceProgressMessage);
    });

    this.onMessage(RACE_EVENTS.RACE_FINISH, (client, message) => {
      this.finishParticipant(client, message as RaceFinishMessage);
    });

    this.onMessage(VOICE_EVENTS.OFFER, (client, payload) => {
      this.onVoiceOffer(client, parseVoiceOffer(payload));
    });
    this.onMessage(VOICE_EVENTS.ANSWER, (client, payload) => {
      this.onVoiceAnswer(client, parseVoiceAnswer(payload));
    });
    this.onMessage(VOICE_EVENTS.ICE_CANDIDATE, (client, payload) => {
      this.onVoiceIceCandidate(client, parseVoiceCandidate(payload));
    });
    this.onMessage(VOICE_EVENTS.END, (client, payload) => {
      this.onVoiceEnd(client, parseVoiceEnd(payload));
    });
    this.onMessage(VOICE_EVENTS.MUTE_TOGGLE, (client, payload) => {
      this.onVoiceMuteToggle(client, parseVoiceMute(payload));
    });

    this.setSimulationInterval(
      (deltaTime) => {
        this.tick(deltaTime);
      },
      Math.round(1000 / TYPING_RACE_DEFAULTS.roomTickRate)
    );
  }

  onJoin(client: Client, options: MatchJoinMessage) {
    const participantId = this.normalizeParticipantId(client, options);
    const isKnownParticipant = this.participants.has(participantId);

    if (this.lifecycle === TYPING_ROOM_LIFECYCLE.CLOSED) {
      client.send(RACE_EVENTS.ROOM_ERROR, { message: "이미 닫힌 방입니다." });
      client.leave();
      return;
    }

    if (this.lifecycle === TYPING_ROOM_LIFECYCLE.EMPTY_GRACE) {
      if (!isKnownParticipant) {
        client.send(RACE_EVENTS.ROOM_ERROR, {
          message: "재접속 대기 중인 방입니다.",
        });
        client.leave();
        return;
      }
      this.lifecycle = TYPING_ROOM_LIFECYCLE.ACTIVE;
      void this.setPrivate(false);
    }

    if (
      this.lobbyMode &&
      this.status !== TYPING_ROOM_STATUS.WAITING &&
      this.status !== TYPING_ROOM_STATUS.FINISHED &&
      !isKnownParticipant
    ) {
      client.send(RACE_EVENTS.ROOM_ERROR, { message: "이미 시작된 방입니다." });
      client.leave();
      return;
    }

    this.registerParticipant(client, options);
    const participant = this.participants.get(this.getParticipantId(client));

    if (participant && this.lobbyMode) {
      this.appendSystemMessage(`${participant.label}님이 입장했습니다.`);
      this.syncState();
    }

    this.clock.setTimeout(() => {
      client.send(RACE_EVENTS.RACE_SEED, this.roomSeed);
      client.send(RACE_EVENTS.ROOM_STATE, this.createRoomSnapshot());
      client.send(RACE_EVENTS.RACE_STATE, this.createSnapshot());
    }, 50);
  }

  onLeave(client: Client) {
    const participantId = this.getParticipantId(client);
    const participant = participantId
      ? this.participants.get(participantId)
      : null;
    this.clientParticipantIds.delete(client.sessionId);
    this.cleanupVoiceSessionByParticipant(participantId, "network");

    if (this.explicitLeavingClientIds.delete(client.sessionId)) {
      this.refreshLifecycle();
      return;
    }

    if (this.lobbyMode && participant) {
      this.scheduleParticipantCleanup(participant.id);
      this.appendSystemMessage(
        `${participant.label}님과의 연결이 잠시 끊겼습니다.`
      );
      this.refreshLifecycle();
      this.syncState();
      return;
    }

    if (participantId) {
      this.removeParticipant(participantId);
    }

    this.syncState();
  }

  private registerParticipant(client: Client, message?: MatchJoinMessage) {
    const participantId = this.normalizeParticipantId(client, message);
    this.clientParticipantIds.set(client.sessionId, participantId);
    this.clearParticipantCleanup(participantId);
    this.lifecycle = TYPING_ROOM_LIFECYCLE.ACTIVE;
    if (this.lobbyMode) {
      void this.setPrivate(false);
    }

    // options.userId 는 userToken 검증을 통과할 때만 신뢰한다(위조 차단). 비로그인/게스트는 null.
    const verifiedUserId = verifyTypingRaceUserToken(
      message?.userId,
      message?.userToken
    )
      ? (message?.userId ?? null)
      : null;

    const existing = this.participants.get(participantId);
    if (existing) {
      existing.label = message?.playerLabel || existing.label;
      existing.characterId =
        optionalText(message?.characterId, MAX_SEED_ID_LENGTH) ??
        existing.characterId;
      // 재접속 시 유효한 토큰이 새로 들어오면 검증된 userId 를 갱신한다(기존 값을 무검증으로 덮지 않음).
      if (verifiedUserId) {
        existing.verifiedUserId = verifiedUserId;
      }
      if (!this.hostId) {
        this.hostId = existing.id;
        existing.isReady = true;
      }
      this.syncState();
      return;
    }

    if (!this.hostId) {
      this.hostId = participantId;
    }

    const participant: RoomParticipant = {
      id: participantId,
      label: message?.playerLabel || "Guest",
      characterId: optionalText(message?.characterId, MAX_SEED_ID_LENGTH),
      accent:
        TYPING_RACE_LANE_ACCENTS[
          this.participants.size % TYPING_RACE_LANE_ACCENTS.length
        ],
      kind: "player",
      progress: 0,
      cpm: 0,
      wpm: 0,
      accuracy: 100,
      mistakeCount: 0,
      elapsedTimeMs: 0,
      finishedAt: null,
      score: 0,
      rank: null,
      isReady: !this.lobbyMode || this.hostId === participantId,
      joinedAt: Date.now(),
      verifiedUserId,
    };

    this.participants.set(participantId, participant);
    this.syncState();
  }

  private normalizeParticipantId(client: Client, message?: MatchJoinMessage) {
    return (
      optionalText(message?.playerId, MAX_SEED_ID_LENGTH) ?? client.sessionId
    );
  }

  private getParticipantId(client: Client) {
    return this.clientParticipantIds.get(client.sessionId) ?? client.sessionId;
  }

  private clearParticipantCleanup(participantId: string) {
    const timer = this.participantCleanupTimers.get(participantId);
    if (!timer) return;
    timer.clear();
    this.participantCleanupTimers.delete(participantId);
  }

  private scheduleParticipantCleanup(participantId: string) {
    this.clearParticipantCleanup(participantId);
    const timer = this.clock.setTimeout(() => {
      this.participantCleanupTimers.delete(participantId);
      this.removeParticipant(participantId);
      this.syncState();
    }, LOBBY_RECONNECT_GRACE_MS);
    this.participantCleanupTimers.set(participantId, timer);
  }

  private leaveExplicitly(client: Client) {
    const participantId = this.getParticipantId(client);
    this.explicitLeavingClientIds.add(client.sessionId);
    this.clientParticipantIds.delete(client.sessionId);

    if (participantId) {
      this.removeParticipant(participantId);
    }
    this.cleanupVoiceSessionByParticipant(participantId, "hangup");

    this.refreshLifecycle();
    this.syncState();
    client.leave();
  }

  private removeParticipant(participantId: string) {
    const participant = this.participants.get(participantId);
    if (!participant) return;

    this.clearParticipantCleanup(participantId);
    this.participants.delete(participantId);
    if (this.hostId === participantId) {
      this.hostId = this.participants.keys().next().value ?? null;
      const nextHost = this.hostId ? this.participants.get(this.hostId) : null;
      if (nextHost) {
        nextHost.isReady = true;
      }
    }

    if (this.lobbyMode) {
      this.appendSystemMessage(`${participant.label}님이 퇴장했습니다.`);
      if (this.participants.size === 0) {
        this.status = TYPING_ROOM_STATUS.CLOSED;
        this.lifecycle = TYPING_ROOM_LIFECYCLE.CLOSED;
        void this.setPrivate(true);
        void this.disconnect();
      }
    }
  }

  private onVoiceOffer(
    client: Client,
    payload:
      | (Pick<VoiceOfferMessage, "sessionId" | "targetParticipantId"> & {
          sdp: string;
        })
      | null
  ) {
    const senderParticipantId = this.getParticipantId(client);
    if (!senderParticipantId || !payload) {
      this.sendVoiceError(client, {
        message: senderParticipantId
          ? "통화 요청 형식이 올바르지 않습니다."
          : "참가자 정보를 찾지 못했습니다.",
      });
      return;
    }

    if (senderParticipantId === payload.targetParticipantId) {
      this.sendVoiceError(client, {
        message: "통화 대상은 본인이 될 수 없습니다.",
      });
      return;
    }

    if (!this.isParticipantInRoom(payload.targetParticipantId)) {
      this.sendVoiceError(client, {
        sessionId: payload.sessionId,
        targetParticipantId: payload.targetParticipantId,
        message: "상대를 찾을 수 없습니다.",
      });
      return;
    }

    if (this.participantToVoiceSession.has(senderParticipantId)) {
      this.sendVoiceError(client, {
        sessionId: payload.sessionId,
        targetParticipantId: payload.targetParticipantId,
        message: "이미 통화 진행 중입니다.",
      });
      return;
    }

    const targetSession = this.participantToVoiceSession.get(
      payload.targetParticipantId
    );
    if (targetSession) {
      this.sendVoiceError(client, {
        sessionId: payload.sessionId,
        targetParticipantId: payload.targetParticipantId,
        message: "상대가 통화 중입니다.",
      });
      return;
    }

    if (!isNonEmptyString(payload.sessionId)) {
      this.sendVoiceError(client, {
        message: "통화 세션 정보가 유효하지 않습니다.",
      });
      return;
    }

    const existingSession = this.voiceSessions.get(payload.sessionId);
    if (existingSession && existingSession.participants.size > 0) {
      this.sendVoiceError(client, {
        sessionId: payload.sessionId,
        targetParticipantId: payload.targetParticipantId,
        message: "동일한 통화 요청이 이미 진행 중입니다.",
      });
      return;
    }

    this.ensureVoiceSession(
      payload.sessionId,
      senderParticipantId,
      payload.targetParticipantId
    );
    this.refreshVoiceTimeout(payload.sessionId);
    this.sendVoicePayloadToParticipant(
      payload.targetParticipantId,
      VOICE_EVENTS.OFFER,
      {
        sessionId: payload.sessionId,
        fromParticipantId: senderParticipantId,
        targetParticipantId: payload.targetParticipantId,
        sdp: payload.sdp,
      }
    );
  }

  private onVoiceAnswer(
    client: Client,
    payload:
      | (Pick<VoiceAnswerMessage, "sessionId" | "targetParticipantId"> & {
          sdp: string;
        })
      | null
  ) {
    const senderParticipantId = this.getParticipantId(client);
    if (!senderParticipantId || !payload) {
      this.sendVoiceError(client, {
        message: senderParticipantId
          ? "통화 응답 형식이 올바르지 않습니다."
          : "참가자 정보를 찾지 못했습니다.",
      });
      return;
    }

    const session = this.voiceSessions.get(payload.sessionId);
    if (!session || !session.participants.has(senderParticipantId)) {
      this.sendVoiceError(client, {
        sessionId: payload.sessionId,
        targetParticipantId: payload.targetParticipantId,
        message: "통화 세션이 유효하지 않습니다.",
      });
      return;
    }

    const targetParticipantId = this.resolveVoiceTarget(
      payload.sessionId,
      senderParticipantId,
      payload.targetParticipantId
    );
    if (!targetParticipantId) {
      this.sendVoiceError(client, {
        sessionId: payload.sessionId,
        targetParticipantId: payload.targetParticipantId,
        message: "통화 대상이 일치하지 않습니다.",
      });
      return;
    }

    this.clearVoiceTimeout(payload.sessionId);
    this.sendVoicePayloadToParticipant(
      targetParticipantId,
      VOICE_EVENTS.ANSWER,
      {
        sessionId: payload.sessionId,
        fromParticipantId: senderParticipantId,
        targetParticipantId,
        sdp: payload.sdp,
      }
    );
  }

  private onVoiceIceCandidate(
    client: Client,
    payload:
      | (Pick<VoiceIceCandidateMessage, "sessionId" | "targetParticipantId"> & {
          candidate: VoiceIceCandidateLike;
        })
      | null
  ) {
    const senderParticipantId = this.getParticipantId(client);
    if (!senderParticipantId || !payload) return;

    const session = this.voiceSessions.get(payload.sessionId);
    if (!session || !session.participants.has(senderParticipantId)) return;

    const targetParticipantId = this.resolveVoiceTarget(
      payload.sessionId,
      senderParticipantId,
      payload.targetParticipantId
    );
    if (!targetParticipantId) return;

    this.refreshVoiceTimeout(payload.sessionId);
    this.sendVoicePayloadToParticipant(
      targetParticipantId,
      VOICE_EVENTS.ICE_CANDIDATE,
      {
        sessionId: payload.sessionId,
        fromParticipantId: senderParticipantId,
        targetParticipantId,
        candidate: payload.candidate,
      }
    );
  }

  private onVoiceEnd(
    client: Client,
    payload:
      | (Pick<VoiceEndMessage, "sessionId" | "targetParticipantId"> & {
          reason?: VoiceEndMessage["reason"];
        })
      | null
  ) {
    const senderParticipantId = this.getParticipantId(client);
    if (!senderParticipantId || !payload) return;

    const session = this.voiceSessions.get(payload.sessionId);
    if (!session || !session.participants.has(senderParticipantId)) return;

    this.terminateVoiceSession(payload.sessionId, payload.reason ?? "hangup");
  }

  private onVoiceMuteToggle(
    client: Client,
    payload:
      | (Pick<VoiceMuteToggleMessage, "sessionId" | "targetParticipantId"> & {
          muted: boolean;
        })
      | null
  ) {
    const senderParticipantId = this.getParticipantId(client);
    if (!senderParticipantId || !payload) return;

    const session = this.voiceSessions.get(payload.sessionId);
    if (!session || !session.participants.has(senderParticipantId)) return;

    const targetParticipantId = this.resolveVoiceTarget(
      payload.sessionId,
      senderParticipantId,
      payload.targetParticipantId
    );
    if (!targetParticipantId) return;

    this.sendVoicePayloadToParticipant(
      targetParticipantId,
      VOICE_EVENTS.MUTE_TOGGLE,
      {
        sessionId: payload.sessionId,
        fromParticipantId: senderParticipantId,
        targetParticipantId,
        muted: payload.muted,
      }
    );
  }

  private ensureVoiceSession(
    sessionId: string,
    firstParticipantId: string,
    secondParticipantId: string
  ) {
    const existing = this.voiceSessions.get(sessionId);
    if (existing) {
      existing.participants.add(firstParticipantId);
      existing.participants.add(secondParticipantId);
      this.participantToVoiceSession.set(firstParticipantId, sessionId);
      this.participantToVoiceSession.set(secondParticipantId, sessionId);
      this.refreshVoiceTimeout(sessionId);
      return;
    }

    const timeout = this.clock.setTimeout(() => {
      this.terminateVoiceSession(sessionId, "timeout");
    }, VOICE_SESSION_TIMEOUT_MS);

    this.voiceSessions.set(sessionId, {
      participants: new Set([firstParticipantId, secondParticipantId]),
      timeout,
    });
    this.participantToVoiceSession.set(firstParticipantId, sessionId);
    this.participantToVoiceSession.set(secondParticipantId, sessionId);
  }

  private refreshVoiceTimeout(sessionId: string) {
    const state = this.voiceSessions.get(sessionId);
    if (!state || !state.timeout) return;
    state.timeout?.clear();
    state.timeout = this.clock.setTimeout(() => {
      this.terminateVoiceSession(sessionId, "timeout");
    }, VOICE_SESSION_TIMEOUT_MS);
  }

  private clearVoiceTimeout(sessionId: string) {
    const state = this.voiceSessions.get(sessionId);
    if (!state) return;
    state.timeout?.clear();
    state.timeout = null;
  }

  private cleanupVoiceSessionByParticipant(
    participantId: string | undefined | null,
    reason: VoiceEndMessage["reason"]
  ) {
    if (!participantId) return;
    const sessionId = this.participantToVoiceSession.get(participantId);
    if (!sessionId) return;

    const session = this.voiceSessions.get(sessionId);
    if (!session) {
      this.participantToVoiceSession.delete(participantId);
      return;
    }
    this.sendVoiceEndToSession(sessionId, reason);
    this.clearVoiceSession(sessionId);
  }

  private terminateVoiceSession(
    sessionId: string,
    reason: VoiceEndMessage["reason"]
  ) {
    const session = this.voiceSessions.get(sessionId);
    if (!session) return;
    this.sendVoiceEndToSession(sessionId, reason);
    this.clearVoiceSession(sessionId);
  }

  private sendVoiceEndToSession(
    sessionId: string,
    reason: VoiceEndMessage["reason"]
  ) {
    const session = this.voiceSessions.get(sessionId);
    if (!session) return;
    for (const participantId of session.participants) {
      const targetParticipantId = [...session.participants].find(
        (id) => id !== participantId
      );
      if (!targetParticipantId) continue;
      this.sendVoicePayloadToParticipant(participantId, VOICE_EVENTS.END, {
        sessionId,
        fromParticipantId: targetParticipantId,
        targetParticipantId: participantId,
        reason: reason ?? "hangup",
      });
    }
  }

  private clearVoiceSession(sessionId: string) {
    const session = this.voiceSessions.get(sessionId);
    if (!session) return;
    session.timeout?.clear();
    this.voiceSessions.delete(sessionId);
    for (const participantId of session.participants) {
      this.participantToVoiceSession.delete(participantId);
    }
  }

  private resolveVoiceTarget(
    sessionId: string,
    senderParticipantId: string,
    fallbackTargetParticipantId: string
  ) {
    const state = this.voiceSessions.get(sessionId);
    if (!state) return null;
    if (
      state.participants.has(fallbackTargetParticipantId) &&
      fallbackTargetParticipantId !== senderParticipantId
    ) {
      return fallbackTargetParticipantId;
    }
    return (
      [...state.participants].find(
        (participantId) => participantId !== senderParticipantId
      ) ?? null
    );
  }

  private getClientByParticipantId(participantId: string) {
    const sessionId = [...this.clientParticipantIds.entries()].find(
      ([, candidate]) => candidate === participantId
    )?.[0];
    return (
      this.clients.find((client) => client.sessionId === sessionId) ?? null
    );
  }

  private isParticipantInRoom(participantId: string) {
    return this.participants.has(participantId);
  }

  private sendVoicePayloadToParticipant(
    participantId: string,
    event: (typeof VOICE_EVENTS)[keyof typeof VOICE_EVENTS],
    payload: Record<string, unknown>
  ) {
    const targetClient = this.getClientByParticipantId(participantId);
    if (!targetClient) return;
    targetClient.send(event, payload);
  }

  private sendVoiceError(
    client: Client,
    payload: {
      sessionId?: string;
      targetParticipantId?: string;
      message: string;
    }
  ) {
    client.send(VOICE_EVENTS.ERROR, payload);
  }

  private refreshLifecycle() {
    if (!this.lobbyMode || this.lifecycle === TYPING_ROOM_LIFECYCLE.CLOSED) {
      return;
    }

    this.lifecycle =
      this.clientParticipantIds.size > 0
        ? TYPING_ROOM_LIFECYCLE.ACTIVE
        : TYPING_ROOM_LIFECYCLE.EMPTY_GRACE;
    void this.setPrivate(this.lifecycle !== TYPING_ROOM_LIFECYCLE.ACTIVE);
  }

  private appendChatMessage(message: TypingRoomChatMessage) {
    this.lobbyMessages.push(message);
    if (this.lobbyMessages.length > MAX_LOBBY_CHAT_MESSAGES) {
      this.lobbyMessages.splice(
        0,
        this.lobbyMessages.length - MAX_LOBBY_CHAT_MESSAGES
      );
    }
  }

  private appendSystemMessage(content: string) {
    this.appendChatMessage({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      messageType: "system",
      content,
      createdAt: Date.now(),
    });
  }

  private addChat(client: Client, message: RoomChatMessage) {
    if (this.status !== TYPING_ROOM_STATUS.WAITING) return;
    const participantId = this.getParticipantId(client);
    const participant = this.participants.get(participantId);
    if (!participant) return;
    const content = optionalText(message.content, MAX_CHAT_MESSAGE_LENGTH);
    if (!content) return;
    this.appendChatMessage({
      id: `${Date.now()}-${participantId}`,
      senderId: participant.id,
      senderLabel: participant.label,
      messageType: "user",
      content,
      createdAt: Date.now(),
    });
    const lastMessage = this.lobbyMessages[this.lobbyMessages.length - 1];
    if (lastMessage) {
      this.broadcast(RACE_EVENTS.ROOM_CHAT, lastMessage);
    }
    this.syncState();
  }

  private updateSettings(client: Client, message: RoomSettingsUpdateMessage) {
    if (!this.lobbyMode || this.status !== TYPING_ROOM_STATUS.WAITING) return;
    if (this.getParticipantId(client) !== this.hostId) {
      client.send(RACE_EVENTS.ROOM_ERROR, {
        message: "방장만 설정을 변경할 수 있어요.",
      });
      return;
    }

    let didChange = false;
    let languageChanged = false;
    const next = { ...this.settings } as TypingRoomSettings;

    const nextVisibility = Object.values(TYPING_ROOM_VISIBILITY).includes(
      message.visibility as TypingRoomVisibility
    )
      ? (message.visibility as TypingRoomVisibility)
      : next.visibility;

    if (nextVisibility !== next.visibility) {
      next.visibility = nextVisibility;
      didChange = true;
    }

    if (typeof message.maxParticipants === "number") {
      const normalized = clampOption(
        message.maxParticipants,
        [...LOBBY_MAX_PARTICIPANTS_OPTIONS],
        next.maxParticipants
      );
      if (normalized < this.participants.size) {
        client.send(RACE_EVENTS.ROOM_ERROR, {
          message: "현재 참여자 수보다 적은 인원으로 변경할 수 없습니다.",
        });
        return;
      }
      if (normalized !== next.maxParticipants) {
        next.maxParticipants = Math.min(MAX_PLAYERS_PER_ROOM, normalized);
        this.maxClients = next.maxParticipants;
        didChange = true;
      }
    }

    if (
      Object.values(TYPING_ROOM_TEXT_TYPE).includes(
        message.textType as TypingRoomTextType
      )
    ) {
      const nextTextType = message.textType as TypingRoomTextType;
      if (nextTextType !== next.textType) {
        next.textType = nextTextType;
        didChange = true;
      }
    }

    if (
      Object.values(TYPING_ROOM_LANGUAGE).includes(
        message.language as TypingRoomLanguage
      )
    ) {
      const nextLanguage = message.language as TypingRoomLanguage;
      if (nextLanguage !== next.language) {
        next.language = nextLanguage;
        this.roomSeed = createFallbackRaceSeed(next.language);
        languageChanged = true;
        didChange = true;
      }
    }

    if (
      Object.values(TYPING_ROOM_DIFFICULTY).includes(
        message.difficulty as TypingRoomDifficulty
      )
    ) {
      const nextDifficulty = message.difficulty as TypingRoomDifficulty;
      if (nextDifficulty !== next.difficulty) {
        next.difficulty = nextDifficulty;
        didChange = true;
      }
    }

    const nextRoundCount = clampOption(
      message.roundCount,
      [...LOBBY_ROUND_COUNT_OPTIONS],
      next.roundCount
    );
    if (nextRoundCount !== next.roundCount) {
      next.roundCount = nextRoundCount;
      didChange = true;
    }

    if (
      Object.values(TYPING_ROOM_MODE).includes(message.mode as TypingRoomMode)
    ) {
      const nextMode = message.mode as TypingRoomMode;
      if (nextMode !== next.mode) {
        next.mode = nextMode;
        didChange = true;
      }
    }

    if (
      typeof message.selectedDeckId === "string" &&
      message.selectedDeckId.length > 0
    ) {
      const nextDeckId = message.selectedDeckId.slice(0, MAX_SEED_ID_LENGTH);
      if (nextDeckId !== next.selectedDeckId) {
        next.selectedDeckId = nextDeckId;
        didChange = true;
      }
    } else if (message.selectedDeckId === null) {
      if (next.selectedDeckId !== undefined) {
        next.selectedDeckId = undefined;
        didChange = true;
      }
    }

    if (
      Object.values(TYPING_DECK_VISIBILITY).includes(
        message.selectedDeckVisibility as TypingDeckVisibility
      )
    ) {
      const nextDeckVisibility =
        message.selectedDeckVisibility as TypingDeckVisibility;
      if (nextDeckVisibility !== next.selectedDeckVisibility) {
        next.selectedDeckVisibility = nextDeckVisibility;
        didChange = true;
      }
    }

    const nextLobbyDeckTitle = optionalText(
      message.lobbyDeckTitle,
      MAX_SEED_LABEL_LENGTH
    );
    if (
      nextLobbyDeckTitle !== undefined &&
      nextLobbyDeckTitle !== next.lobbyDeckTitle
    ) {
      next.lobbyDeckTitle = nextLobbyDeckTitle;
      didChange = true;
    }

    if (message.raceSeed !== undefined) {
      this.roomSeed = normalizeRaceSeed(
        message.raceSeed ?? undefined,
        next.language
      );
      languageChanged = false;
      didChange = true;
    }

    if (!didChange) return;
    if (languageChanged) {
      next.selectedDeckId = this.roomSeed.deckId;
      next.selectedDeckVisibility = this.roomSeed.deckVisibility;
      next.selectedDeckLanguageTag = this.roomSeed.languageTag;
      next.lobbyDeckTitle = this.roomSeed.lobbyDeckTitle;
    }
    this.settings = this.applyRoomSeedMetadata(next, this.roomSeed);
    this.appendSystemMessage("방 설정이 변경되었습니다.");

    this.resetParticipantReadyState();
    this.syncState();
  }

  private resetParticipantReadyState() {
    this.participants.forEach((participant) => {
      participant.isReady = participant.id === this.hostId;
    });
  }

  private updateReady(client: Client, message: RoomReadyMessage) {
    if (this.status !== TYPING_ROOM_STATUS.WAITING) return;
    const participantId = this.getParticipantId(client);
    const participant = this.participants.get(participantId);
    if (!participant) return;
    const nextReady =
      participantId === this.hostId ? true : Boolean(message.isReady);
    if (participant.isReady === nextReady) return;
    participant.isReady = nextReady;

    if (participantId !== this.hostId) {
      this.appendSystemMessage(
        `${participant.label}님이 ${
          nextReady ? "준비완료했습니다." : "준비 취소했습니다."
        }`
      );
    }

    this.syncState();
  }

  private startFromLobby(client: Client, message?: RoomStartMessage) {
    if (this.status !== TYPING_ROOM_STATUS.WAITING) return;
    if (this.getParticipantId(client) !== this.hostId) {
      client.send(RACE_EVENTS.ROOM_ERROR, {
        message: "방장만 게임을 시작할 수 있어요.",
      });
      return;
    }
    if (!this.canStart()) {
      client.send(RACE_EVENTS.ROOM_ERROR, {
        message: "아직 준비하지 않은 참여자가 있어요.",
      });
      return;
    }

    this.lobbyReturnTimer?.clear();
    this.lobbyReturnTimer = null;
    if (message && "raceSeed" in message) {
      this.roomSeed = normalizeRaceSeed(
        message.raceSeed ?? undefined,
        this.settings.language
      );
      this.settings = this.applyRoomSeedMetadata(this.settings, this.roomSeed);
    }
    this.status = TYPING_ROOM_STATUS.COUNTDOWN;
    this.resetRaceClock(TYPING_RACE_DEFAULTS.roomCountdownSeconds);
    this.broadcast(RACE_EVENTS.RACE_SEED, this.roomSeed);
    if (!this.lobbyMode) {
      this.lock();
    }
    this.syncState();
  }

  private updateParticipantProgress(
    client: Client,
    message: RaceProgressMessage
  ) {
    if (!this.isRaceLive()) {
      return;
    }

    const participant = this.participants.get(this.getParticipantId(client));

    if (!participant) {
      return;
    }

    this.applyParticipantMetrics(participant, message);
  }

  private finishParticipant(client: Client, message: RaceFinishMessage) {
    if (!this.isRaceLive()) {
      return;
    }

    const participant = this.participants.get(this.getParticipantId(client));

    if (!participant || participant.finishedAt !== null) {
      return;
    }

    this.applyParticipantMetrics(participant, message);
    participant.progress = 100;
    participant.elapsedTimeMs = this.serverElapsedTimeMs();
    participant.finishedAt = Date.now();
    participant.score = calculateTypingScore(
      participant.cpm,
      participant.accuracy
    );
    this.updateRanks();

    const results = this.createResultSnapshot();
    const placement =
      results.find((result) => result.userId === participant.id)?.rank ??
      results.length;

    this.broadcast(RACE_EVENTS.RACE_RESULT, {
      placement,
      totalPlayers: this.participants.size,
      completedAt: participant.finishedAt,
      results,
    });

    const allFinished = Array.from(this.participants.values()).every(
      (p) => p.finishedAt !== null
    );
    if (allFinished && this.participants.size > 0) {
      this.status = TYPING_ROOM_STATUS.FINISHED;
      this.stage = TYPING_RACE_STAGE.FINISHED;
      this.unlock();
      this.awardFinishedParticipants();
      if (this.lobbyMode) {
        this.scheduleLobbyReturn();
      }
    }
    this.syncState();
  }

  // 레이스가 종료(전원 완주)되면 검증된 로그인 참가자에게만 경험치를 적립한다.
  //
  // 신뢰 경로: 웹 BFF(인증된 race-seed 발급 지점)가 HMAC userToken 을 발급 → 클라이언트가 join 옵션으로
  // 전달 → race-server 가 동일 시크릿으로 검증 → 통과 시에만 verifiedUserId 저장(카드방 participant 토큰
  // 패턴과 동일). 무검증 클라이언트 식별자(participant.id/playerId)로는 절대 적립하지 않는다.
  // best-effort: awardTypingRaceFinished 호출 실패가 레이스 진행/결과를 깨지 않게 await 하지 않는다.
  private awardFinishedParticipants() {
    const raceId = this.roomId;
    for (const participant of this.participants.values()) {
      if (participant.kind !== "player" || participant.finishedAt === null) {
        continue;
      }
      const userId = this.resolveVerifiedUserId(participant);
      if (!userId) {
        // 검증된 userId 가 없는 참가자(비로그인/게스트/토큰 위조)는 건너뛴다. 무검증 식별자로 적립 금지.
        continue;
      }
      void awardTypingRaceFinished(userId, raceId);
    }
  }

  // 참가자의 검증된 로그인 userId 를 반환한다. onJoin 시 options.userToken HMAC 검증을 통과한
  // 경우에만 verifiedUserId 가 채워지고, 그 외(토큰 없음/위조/게스트/봇)에는 null 이라 적립되지 않는다.
  // participant.id(클라이언트 playerId)는 신뢰하지 않는다 — 적립 식별자로 쓰지 않는다.
  private resolveVerifiedUserId(participant: RoomParticipant): string | null {
    return participant.verifiedUserId ?? null;
  }

  private applyParticipantMetrics(
    participant: RoomParticipant,
    message: RaceProgressMessage | RaceFinishMessage
  ) {
    participant.progress = clampRaceProgress(message.progress);
    const elapsedTimeMs = this.serverElapsedTimeMs();
    const promptTypingUnits = Math.max(
      1,
      countTypingMetricUnits(this.roomSeed.prompt, this.speedStyle)
    );
    const typedUnits =
      normalizeNonNegativeInteger(message.typedUnitCount) ||
      Math.round((promptTypingUnits * participant.progress) / 100);
    const observedCpm =
      elapsedTimeMs > 0 ? Math.round((typedUnits / elapsedTimeMs) * 60_000) : 0;
    const reportedCpm = normalizeNonNegativeInteger(message.cpm ?? message.wpm);
    const cpm = Math.min(
      MAX_REASONABLE_CPM,
      reportedCpm > 0 ? reportedCpm : observedCpm,
      observedCpm > 0 ? observedCpm : MAX_REASONABLE_CPM
    );
    participant.cpm = cpm;
    participant.wpm =
      this.speedStyle === TYPING_SPEED_STYLE.KO_JASO ? 0 : toWpmFromCpm(cpm);
    participant.accuracy = clampPercent(message.accuracy);
    participant.mistakeCount = normalizeNonNegativeInteger(
      message.mistakeCount
    );
    participant.elapsedTimeMs = elapsedTimeMs;
    participant.score = calculateTypingScore(
      participant.cpm,
      participant.accuracy
    );
  }

  private isRaceLive() {
    return (
      this.status === TYPING_ROOM_STATUS.LIVE &&
      this.stage === TYPING_RACE_STAGE.LIVE
    );
  }

  private scheduleLobbyReturn() {
    if (this.lobbyReturnTimer) {
      return;
    }

    this.lobbyReturnTimer = this.clock.setTimeout(() => {
      this.lobbyReturnTimer = null;
      if (!this.lobbyMode || this.status !== TYPING_ROOM_STATUS.FINISHED) {
        return;
      }

      this.status = TYPING_ROOM_STATUS.WAITING;
      this.unlock();
      this.resetRaceClock(TYPING_RACE_DEFAULTS.roomCountdownSeconds);
      this.resetParticipantReadyState();
      this.appendSystemMessage("경기가 끝나 대기실로 돌아왔습니다.");
      this.syncState();
    }, LOBBY_RETURN_DELAY_MS);
  }

  private serverElapsedTimeMs() {
    return normalizeNonNegativeInteger(Date.now() - this.startedAt);
  }

  private updateRanks() {
    const ranked = rankTypingResults(this.createResultSnapshot(false));
    ranked.forEach((result) => {
      const participant = this.participants.get(result.userId);
      if (participant) participant.rank = result.rank;
    });
  }

  private createResultSnapshot(onlyFinished = true): TypingResultSnapshot[] {
    return rankTypingResults(
      Array.from(this.participants.values())
        .filter(
          (participant) => !onlyFinished || participant.finishedAt !== null
        )
        .map((participant) => ({
          userId: participant.id,
          label: participant.label,
          cpm: participant.cpm,
          wpm: participant.wpm,
          accuracy: participant.accuracy,
          mistakeCount: participant.mistakeCount,
          elapsedTimeMs: participant.elapsedTimeMs,
          score: participant.score,
          finishedAt: participant.finishedAt ?? Number.MAX_SAFE_INTEGER,
        }))
    );
  }

  private tick(deltaTime: number) {
    if (this.status === TYPING_ROOM_STATUS.WAITING) {
      return;
    }

    if (this.stage === TYPING_RACE_STAGE.COUNTDOWN) {
      this.countdownAccumulator += deltaTime;

      if (this.countdownAccumulator >= 1000) {
        this.countdownAccumulator -= 1000;
        this.countdownRemaining = Math.max(0, this.countdownRemaining - 1);

        if (this.countdownRemaining === 0) {
          this.stage = TYPING_RACE_STAGE.LIVE;
          this.status = TYPING_ROOM_STATUS.LIVE;
          this.startedAt = Date.now();
          if (!this.lobbyMode) {
            this.lock();
          }
        }
      }
    }

    if (this.stage === TYPING_RACE_STAGE.LIVE) {
      const elapsedSeconds = (Date.now() - this.startedAt) / 1000;
      const promptTypingUnits = Math.max(
        1,
        countTypingMetricUnits(this.roomSeed.prompt, this.speedStyle)
      );

      this.benchmarks.forEach((benchmark) => {
        const typedUnits = elapsedSeconds * (benchmark.cpm / 60);
        benchmark.progress = clampRaceProgress(
          (typedUnits / promptTypingUnits) * 100
        );
      });
    }

    this.syncState();
  }

  private applyRoomSeedMetadata(
    settings: TypingRoomSettings,
    seed: RaceSeedMessage
  ): TypingRoomSettings {
    const selectedDeckVisibility =
      normalizeDeckVisibility(settings.selectedDeckVisibility) ??
      normalizeDeckVisibility(seed.deckVisibility);
    const lobbyDeckTitle =
      selectedDeckVisibility === TYPING_DECK_VISIBILITY.PRIVATE
        ? PRIVATE_DECK_LOBBY_TITLE
        : (optionalText(settings.lobbyDeckTitle, MAX_SEED_LABEL_LENGTH) ??
          optionalText(seed.lobbyDeckTitle, MAX_SEED_LABEL_LENGTH) ??
          optionalText(seed.participantDeckTitle, MAX_SEED_LABEL_LENGTH));

    return {
      ...settings,
      selectedDeckId:
        optionalText(settings.selectedDeckId, MAX_SEED_ID_LENGTH) ??
        optionalText(seed.deckId, MAX_SEED_ID_LENGTH),
      selectedDeckVisibility,
      selectedDeckLanguageTag:
        normalizeDeckLanguageTag(settings.selectedDeckLanguageTag) ??
        normalizeDeckLanguageTag(seed.languageTag),
      lobbyDeckTitle,
    };
  }

  private createSnapshot(): TypingRaceSnapshot {
    const lanes: TypingRaceLaneSnapshot[] = [
      ...this.participants.values(),
      ...this.benchmarks.values(),
    ]
      .slice(0, MAX_PLAYERS_PER_ROOM)
      .map((participant) => ({
        id: participant.id,
        label: participant.label,
        accent: participant.accent,
        progress: participant.progress,
        wpm: participant.wpm,
        cpm: participant.cpm,
        displaySpeed:
          this.speedStyle === TYPING_SPEED_STYLE.KO_JASO
            ? participant.cpm
            : participant.wpm,
        role:
          participant.kind === "benchmark"
            ? TYPING_RACE_LANE_ROLE.BENCHMARK
            : TYPING_RACE_LANE_ROLE.GUEST,
        isReady: participant.isReady,
      }));

    return {
      stage: this.stage,
      countdownRemaining: this.countdownRemaining,
      headline: "",
      subheadline: "",
      roundLabel: this.roomSeed.roundLabel,
      lanes,
      speedUnit: getTypingDisplayUnit(this.speedStyle),
    };
  }

  private createSummary(): TypingRoomSummary {
    return {
      ...this.settings,
      roomId: this.roomId,
      roomCode: this.roomCode,
      status: this.status,
      lifecycle: this.lifecycle,
      currentParticipants:
        this.lifecycle === TYPING_ROOM_LIFECYCLE.EMPTY_GRACE
          ? 0
          : this.participants.size,
      hostLabel: this.hostId
        ? this.participants.get(this.hostId)?.label
        : undefined,
      createdAt: this.createdAt,
    };
  }

  private createRoomSnapshot(): TypingRoomSnapshot {
    const participants: TypingRoomParticipantSnapshot[] = Array.from(
      this.participants.values()
    ).map((participant) => ({
      id: participant.id,
      label: participant.label,
      characterId: participant.characterId,
      role: participant.id === this.hostId ? "host" : "guest",
      isReady: participant.isReady,
      progress: participant.progress,
      cpm: participant.cpm,
      wpm: participant.wpm,
      accuracy: participant.accuracy,
      mistakeCount: participant.mistakeCount,
      elapsedTimeMs: participant.elapsedTimeMs,
      finishedAt: participant.finishedAt,
      score: participant.score,
      rank: participant.rank,
    }));

    return {
      ...this.createSummary(),
      participants,
      hostId: this.hostId,
      currentRound: 1,
      canStart: this.canStart(),
      results: this.createResultSnapshot(),
      messages: [...this.lobbyMessages],
    };
  }

  private canStart() {
    return (
      this.participants.size > 0 &&
      Array.from(this.participants.values()).every(
        (participant) => participant.isReady
      )
    );
  }

  private bootstrapBenchmarks() {
    BENCHMARKS.forEach((benchmark) => {
      this.benchmarks.set(benchmark.id, {
        id: benchmark.id,
        label: benchmark.label,
        accent: benchmark.accent,
        kind: "benchmark",
        progress: 0,
        cpm: benchmark.cpm,
        wpm:
          this.speedStyle === TYPING_SPEED_STYLE.KO_JASO
            ? 0
            : toWpmFromCpm(benchmark.cpm),
        accuracy: 100,
        mistakeCount: 0,
        elapsedTimeMs: 0,
        finishedAt: null,
        score: 0,
        rank: null,
        isReady: true,
        joinedAt: Date.now(),
        // 벤치마크(봇)는 로그인 사용자가 아니므로 항상 검증된 userId 없음.
        verifiedUserId: null,
      });
    });
  }

  private resetRaceClock(seconds: number) {
    this.stage = TYPING_RACE_STAGE.COUNTDOWN;
    this.countdownRemaining = seconds;
    this.startedAt = Date.now();
    this.countdownAccumulator = 0;
    this.participants.forEach((participant) => {
      participant.progress = 0;
      participant.cpm = 0;
      participant.wpm = 0;
      participant.accuracy = 100;
      participant.mistakeCount = 0;
      participant.elapsedTimeMs = 0;
      participant.finishedAt = null;
      participant.score = 0;
      participant.rank = null;
    });
  }

  private syncState() {
    const roomSnapshot = this.createRoomSnapshot();
    this.setMetadata(this.createSummary());
    this.broadcast(RACE_EVENTS.ROOM_STATE, roomSnapshot);
    this.broadcast(RACE_EVENTS.RACE_STATE, this.createSnapshot());
  }
}
