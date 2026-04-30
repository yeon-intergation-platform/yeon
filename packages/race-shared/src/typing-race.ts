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

export const RACE_EVENTS = {
  MATCH_JOIN: "match.join",
  MATCH_ACCEPTED: "match.accepted",
  ROOM_STATE: "room.state",
  ROOM_READY: "room.ready",
  ROOM_START: "room.start",
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

export type TypingRoomSettings = {
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
  createdAt: number;
};

export type TypingRoomParticipantSnapshot = {
  id: string;
  label: string;
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
};

export type MatchJoinMessage = {
  difficulty?: string;
  playerLabel: string;
  playerId?: string;
  locale?: "ko" | "en";
};

export type TypingRoomCreateMessage = Partial<TypingRoomSettings> & {
  playerLabel?: string;
  playerId?: string;
  locale?: "ko" | "en";
  roomMode?: "lobby" | "quick";
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

export type RaceSeedMessage = {
  passageId: string;
  prompt: string;
  roundLabel: string;
};

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
};

export type RaceFinishMessage = {
  progress: number;
  cpm?: number;
  wpm: number;
  accuracy: number;
  mistakeCount?: number;
  elapsedTimeMs?: number;
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

export function rankTypingResults(
  results: readonly RankableTypingResult[],
): TypingResultSnapshot[] {
  return [...results]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (a.elapsedTimeMs !== b.elapsedTimeMs) return a.elapsedTimeMs - b.elapsedTimeMs;
      if (a.mistakeCount !== b.mistakeCount) return a.mistakeCount - b.mistakeCount;
      return a.finishedAt - b.finishedAt;
    })
    .map((result, index) => ({
      ...result,
      rank: index + 1,
    }));
}
