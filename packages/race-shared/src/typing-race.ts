export const TYPING_RACE_ROOM_NAME = "typing_race_public";

export const TYPING_RACE_STAGE = {
  COUNTDOWN: "countdown",
  LIVE: "live",
  FINISHED: "finished",
} as const;

export type TypingRaceStage =
  (typeof TYPING_RACE_STAGE)[keyof typeof TYPING_RACE_STAGE];

export const TYPING_RACE_LANE_ROLE = {
  LOCAL: "local",
  GUEST: "guest",
  BENCHMARK: "benchmark",
} as const;

export type TypingRaceLaneRole =
  (typeof TYPING_RACE_LANE_ROLE)[keyof typeof TYPING_RACE_LANE_ROLE];

export const TYPING_ROOM_STATUS = {
  WAITING: "waiting",
  COUNTDOWN: "countdown",
  LIVE: "live",
  FINISHED: "finished",
  CLOSED: "closed",
} as const;

export type TypingRoomStatus =
  (typeof TYPING_ROOM_STATUS)[keyof typeof TYPING_ROOM_STATUS];

export const TYPING_ROOM_VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
} as const;

export type TypingRoomVisibility =
  (typeof TYPING_ROOM_VISIBILITY)[keyof typeof TYPING_ROOM_VISIBILITY];

export const TYPING_ROOM_TEXT_TYPE = {
  SHORT: "short",
  LONG: "long",
  CODE: "code",
} as const;

export type TypingRoomTextType =
  (typeof TYPING_ROOM_TEXT_TYPE)[keyof typeof TYPING_ROOM_TEXT_TYPE];

export const TYPING_ROOM_LANGUAGE = {
  KO: "ko",
  EN: "en",
  CODE: "code",
} as const;

export type TypingRoomLanguage =
  (typeof TYPING_ROOM_LANGUAGE)[keyof typeof TYPING_ROOM_LANGUAGE];

export const TYPING_DECK_LANGUAGE_TAG = {
  KO: "ko",
  EN: "en",
  MIXED: "mixed",
  CODE: "code",
} as const;

export type TypingDeckLanguageTag =
  (typeof TYPING_DECK_LANGUAGE_TAG)[keyof typeof TYPING_DECK_LANGUAGE_TAG];

export const TYPING_DECK_VISIBILITY = {
  DEFAULT: "default",
  PUBLIC: "public",
  PRIVATE: "private",
} as const;

export type TypingDeckVisibility =
  (typeof TYPING_DECK_VISIBILITY)[keyof typeof TYPING_DECK_VISIBILITY];

export const TYPING_ROOM_DIFFICULTY = {
  EASY: "easy",
  NORMAL: "normal",
  HARD: "hard",
} as const;

export type TypingRoomDifficulty =
  (typeof TYPING_ROOM_DIFFICULTY)[keyof typeof TYPING_ROOM_DIFFICULTY];

export const TYPING_ROOM_MODE = {
  FINISH: "finish",
  TIME_LIMIT: "time-limit",
} as const;

export type TypingRoomMode =
  (typeof TYPING_ROOM_MODE)[keyof typeof TYPING_ROOM_MODE];

export const TYPING_RACE_DEFAULTS = {
  countdownSeconds: 10,
  roomCountdownSeconds: 3,
  minPlayers: 1,
  maxPlayers: 6,
  lobbyMaxPlayers: 4,
  roomTickRate: 15,
  progressBroadcastRate: 8,
  sliceAMaxParticipants: [2, 4],
  sliceARoundCount: 1,
} as const;

export const TYPING_RACE_LANE_ACCENTS = [
  "#f4b5ff",
  "#62c5ff",
  "#93d63f",
  "#ff925b",
  "#ff5f73",
  "#ffd148",
] as const;

export const TYPING_SPEED_STYLE = {
  KO_JASO: "ko-jaso",
  ENGLISH_WPM: "english-wpm",
} as const;

export type TypingSpeedStyle =
  (typeof TYPING_SPEED_STYLE)[keyof typeof TYPING_SPEED_STYLE];

export type TypingSpeedMetrics = {
  cpm: number;
  wpm: number;
  displaySpeed: number;
  displayUnit: "타" | "wpm";
  typedUnitCount: number;
};

export const RACE_EVENTS = {
  MATCH_JOIN: "match.join",
  MATCH_ACCEPTED: "match.accepted",
  ROOM_STATE: "room.state",
  ROOM_READY: "room.ready",
  ROOM_START: "room.start",
  ROOM_SETTINGS: "room.settings",
  ROOM_CHAT: "room.chat",
  ROOM_ERROR: "room.error",
  RACE_READY: "race.ready",
  RACE_SEED: "race.seed",
  RACE_COUNTDOWN: "race.countdown",
  RACE_PROGRESS: "race.progress",
  RACE_STATE: "race.state",
  RACE_FINISH: "race.finish",
  RACE_RESULT: "race.result",
  RACE_ERROR: "race.error",
  RACE_PING: "race.ping",
} as const;

export type TypingRaceLaneSnapshot = {
  id: string;
  label: string;
  role: TypingRaceLaneRole;
  progress: number;
  wpm: number;
  cpm?: number;
  displaySpeed?: number;
  accent: string;
  isReady?: boolean;
};

export type TypingRaceSnapshot = {
  stage: TypingRaceStage;
  countdownRemaining: number;
  headline: string;
  subheadline: string;
  roundLabel: string;
  lanes: readonly TypingRaceLaneSnapshot[];
  speedUnit?: string;
};

export type TypingRoomDeckMetadata = {
  selectedDeckId?: string;
  selectedDeckVisibility?: TypingDeckVisibility;
  lobbyDeckTitle?: string;
  selectedDeckLanguageTag?: TypingDeckLanguageTag;
};

export type TypingRaceSeed = {
  passageId: string;
  prompt: string;
  roundLabel: string;
  seedToken?: string;
  deckId?: string;
  deckVisibility?: TypingDeckVisibility;
  lobbyDeckTitle?: string;
  participantDeckTitle?: string;
  languageTag?: TypingDeckLanguageTag;
};

export type TypingRoomSettings = TypingRoomDeckMetadata & {
  title: string;
  visibility: TypingRoomVisibility;
  maxParticipants: number;
  textType: TypingRoomTextType;
  language: TypingRoomLanguage;
  difficulty: TypingRoomDifficulty;
  roundCount: number;
  mode: TypingRoomMode;
};

export type TypingRoomSummary = TypingRoomSettings & {
  roomId: string;
  roomCode: string;
  status: TypingRoomStatus;
  currentParticipants: number;
  hostLabel?: string;
  createdAt: number;
};

export type TypingRoomParticipantSnapshot = {
  id: string;
  label: string;
  characterId?: string;
  role: "host" | "guest";
  isReady: boolean;
  progress: number;
  cpm: number;
  wpm: number;
  accuracy: number;
  mistakeCount: number;
  elapsedTimeMs: number;
  finishedAt: number | null;
  score: number;
  rank: number | null;
};

export type TypingRoomChatMessage = {
  id: string;
  senderId?: string | null;
  senderLabel?: string | null;
  messageType: "user" | "system";
  content: string;
  createdAt: number;
};

export type RoomSettingsUpdateMessage = {
  visibility?: TypingRoomVisibility;
  maxParticipants?: number;
  textType?: TypingRoomTextType;
  language?: TypingRoomLanguage;
  difficulty?: TypingRoomDifficulty;
  roundCount?: number;
  mode?: TypingRoomMode;
  selectedDeckId?: string | null;
  selectedDeckVisibility?: TypingDeckVisibility;
  lobbyDeckTitle?: string | null;
  raceSeed?: TypingRaceSeed | null;
};

export type RoomChatMessage = {
  content: string;
};

export type TypingResultSnapshot = {
  userId: string;
  label: string;
  cpm: number;
  wpm: number;
  accuracy: number;
  mistakeCount: number;
  elapsedTimeMs: number;
  score: number;
  rank: number;
  finishedAt: number;
};

export type TypingRoomSnapshot = TypingRoomSummary & {
  participants: readonly TypingRoomParticipantSnapshot[];
  hostId: string | null;
  currentRound: number;
  canStart: boolean;
  results: readonly TypingResultSnapshot[];
  messages: readonly TypingRoomChatMessage[];
};

export type MatchJoinMessage = {
  difficulty?: string;
  playerLabel: string;
  playerId?: string;
  characterId?: string;
  locale?: "ko" | "en";
};

export type TypingRoomCreateMessage = Partial<TypingRoomSettings> & {
  playerLabel?: string;
  playerId?: string;
  characterId?: string;
  locale?: "ko" | "en";
  roomMode?: "lobby" | "quick";
  raceSeed?: TypingRaceSeed;
};

export type TypingRoomJoinMessage = {
  playerLabel: string;
  playerId?: string;
  locale?: "ko" | "en";
  password?: string;
};

export type MatchAcceptedMessage = {
  roomId: string;
  roomName: string;
  seat: string;
};

export type RaceSeedMessage = TypingRaceSeed;

export type RaceCountdownMessage = {
  countdownSeconds: number;
  startedAt: number;
};

export type RaceProgressMessage = {
  progress: number;
  cpm?: number;
  wpm: number;
  accuracy: number;
  mistakeCount?: number;
  elapsedTimeMs?: number;
  typedUnitCount?: number;
};

export type RaceFinishMessage = {
  progress: number;
  cpm?: number;
  wpm: number;
  accuracy: number;
  mistakeCount?: number;
  elapsedTimeMs?: number;
  typedUnitCount?: number;
  finishedAt: number;
};

export type RaceResultMessage = {
  placement: number;
  totalPlayers: number;
  completedAt: number;
  results: readonly TypingResultSnapshot[];
};

export type RoomReadyMessage = {
  isReady: boolean;
};

export type RoomErrorMessage = {
  message: string;
};

export type RankableTypingResult = Omit<TypingResultSnapshot, "rank"> & {
  rank?: number | null;
};

export function clampRaceProgress(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function normalizeNonNegativeInteger(value: number | undefined) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value ?? 0));
}

export function calculateTypingScore(cpm: number, accuracy: number) {
  const normalizedCpm = normalizeNonNegativeInteger(cpm);
  return Math.round(normalizedCpm * (clampPercent(accuracy) / 100));
}

export function toWpmFromCpm(cpm: number) {
  return Math.round(normalizeNonNegativeInteger(cpm) / 5);
}

export function resolveTypingSpeedStyle(
  value: TypingRoomLanguage | TypingDeckLanguageTag | "ko" | "en" | undefined
) {
  return value === "ko"
    ? TYPING_SPEED_STYLE.KO_JASO
    : TYPING_SPEED_STYLE.ENGLISH_WPM;
}

export function getTypingDisplayUnit(style: TypingSpeedStyle) {
  return style === TYPING_SPEED_STYLE.KO_JASO ? "타" : "wpm";
}

const HANGUL_SYLLABLE_BASE = 0xac00;
const HANGUL_SYLLABLE_END = 0xd7a3;
const HANGUL_JONGSEONG_COUNT = 28;
const HANGUL_COMPAT_JAMO_START = 0x3131;
const HANGUL_COMPAT_JAMO_END = 0x318e;
const HANGUL_JAMO_START = 0x1100;
const HANGUL_JAMO_END = 0x11ff;
const HANGUL_JAMO_EXTENDED_A_START = 0xa960;
const HANGUL_JAMO_EXTENDED_A_END = 0xa97f;
const HANGUL_JAMO_EXTENDED_B_START = 0xd7b0;
const HANGUL_JAMO_EXTENDED_B_END = 0xd7ff;

function isHangulJamo(codePoint: number) {
  return (
    (codePoint >= HANGUL_COMPAT_JAMO_START &&
      codePoint <= HANGUL_COMPAT_JAMO_END) ||
    (codePoint >= HANGUL_JAMO_START && codePoint <= HANGUL_JAMO_END) ||
    (codePoint >= HANGUL_JAMO_EXTENDED_A_START &&
      codePoint <= HANGUL_JAMO_EXTENDED_A_END) ||
    (codePoint >= HANGUL_JAMO_EXTENDED_B_START &&
      codePoint <= HANGUL_JAMO_EXTENDED_B_END)
  );
}

function countKoreanTypingUnits(text: string) {
  return Array.from(text).reduce((count, char) => {
    const codePoint = char.codePointAt(0);
    if (!codePoint) return count;
    if (codePoint >= HANGUL_SYLLABLE_BASE && codePoint <= HANGUL_SYLLABLE_END) {
      const syllableIndex = codePoint - HANGUL_SYLLABLE_BASE;
      const jongseong = syllableIndex % HANGUL_JONGSEONG_COUNT;
      const hasFinalConsonant = jongseong !== 0;
      return count + (hasFinalConsonant ? 3 : 2);
    }
    if (isHangulJamo(codePoint)) {
      return count + 1;
    }
    return count + 1;
  }, 0);
}

export function countTypingMetricUnits(text: string, style: TypingSpeedStyle) {
  return style === TYPING_SPEED_STYLE.KO_JASO
    ? countKoreanTypingUnits(text)
    : Array.from(text).length;
}

export function calculateTypingSpeedMetrics(
  text: string,
  elapsedSeconds: number,
  source: TypingRoomLanguage | TypingDeckLanguageTag | "ko" | "en" | undefined
): TypingSpeedMetrics {
  const style = resolveTypingSpeedStyle(source);
  const typedUnitCount = countTypingMetricUnits(text, style);
  if (elapsedSeconds <= 0 || typedUnitCount === 0) {
    return {
      cpm: 0,
      wpm: 0,
      displaySpeed: 0,
      displayUnit: getTypingDisplayUnit(style),
      typedUnitCount,
    };
  }
  const cpm = Math.round((typedUnitCount / elapsedSeconds) * 60);
  const wpm = style === TYPING_SPEED_STYLE.KO_JASO ? 0 : toWpmFromCpm(cpm);
  return {
    cpm,
    wpm,
    displaySpeed: style === TYPING_SPEED_STYLE.KO_JASO ? cpm : wpm,
    displayUnit: getTypingDisplayUnit(style),
    typedUnitCount,
  };
}

export function rankTypingResults(
  results: readonly RankableTypingResult[]
): TypingResultSnapshot[] {
  return [...results]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (a.elapsedTimeMs !== b.elapsedTimeMs)
        return a.elapsedTimeMs - b.elapsedTimeMs;
      if (a.mistakeCount !== b.mistakeCount)
        return a.mistakeCount - b.mistakeCount;
      return a.finishedAt - b.finishedAt;
    })
    .map((result, index) => ({
      ...result,
      rank: index + 1,
    }));
}
