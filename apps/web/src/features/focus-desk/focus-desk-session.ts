import {
  CARD_REVIEW_DIFFICULTIES,
  type CardDeckItemDto,
  type CardReviewDifficulty,
} from "@yeon/api-contract/card-decks";

export const FOCUS_DESK_MODES = {
  all: "all",
  review: "review",
  exam: "exam",
} as const;

export type FocusDeskMode =
  (typeof FOCUS_DESK_MODES)[keyof typeof FOCUS_DESK_MODES];

export type FocusDeskSessionStatus = "setup" | "running" | "finished";

export const FOCUS_DESK_SESSION_MINUTES = [10, 25, 50] as const;

export type FocusDeskSessionMinutes =
  (typeof FOCUS_DESK_SESSION_MINUTES)[number];

export type FocusDeskReviewStats = {
  reviewed: number;
  skipped: number;
  hard: number;
  good: number;
  easy: number;
};

export type FocusDeskSummary = FocusDeskReviewStats & {
  plannedMinutes: FocusDeskSessionMinutes;
  elapsedSeconds: number;
};

const DEFAULT_FOCUS_DESK_MODE: FocusDeskMode = FOCUS_DESK_MODES.review;
const DEFAULT_SESSION_MINUTES: FocusDeskSessionMinutes = 25;

const REVIEW_PRIORITY: Record<CardReviewDifficulty, number> = {
  [CARD_REVIEW_DIFFICULTIES.hard]: 0,
  [CARD_REVIEW_DIFFICULTIES.good]: 2,
  [CARD_REVIEW_DIFFICULTIES.easy]: 3,
};

export function parseFocusDeskMode(value: string | null): FocusDeskMode {
  return Object.values(FOCUS_DESK_MODES).includes(value as FocusDeskMode)
    ? (value as FocusDeskMode)
    : DEFAULT_FOCUS_DESK_MODE;
}

export function parseFocusDeskSessionMinutes(
  value: string | null
): FocusDeskSessionMinutes {
  const parsed = Number.parseInt(value ?? "", 10);
  return FOCUS_DESK_SESSION_MINUTES.includes(parsed as FocusDeskSessionMinutes)
    ? (parsed as FocusDeskSessionMinutes)
    : DEFAULT_SESSION_MINUTES;
}

export function createInitialFocusDeskStats(): FocusDeskReviewStats {
  return {
    reviewed: 0,
    skipped: 0,
    hard: 0,
    good: 0,
    easy: 0,
  };
}

export function applyFocusDeskReviewResult(
  stats: FocusDeskReviewStats,
  difficulty: CardReviewDifficulty
): FocusDeskReviewStats {
  return {
    ...stats,
    reviewed: stats.reviewed + 1,
    [difficulty]: stats[difficulty] + 1,
  };
}

export function applyFocusDeskSkip(
  stats: FocusDeskReviewStats
): FocusDeskReviewStats {
  return {
    ...stats,
    skipped: stats.skipped + 1,
  };
}

export function getNextFocusDeskCardIndex({
  currentIndex,
  queueLength,
}: {
  currentIndex: number;
  queueLength: number;
}): number {
  return Math.min(currentIndex + 1, queueLength);
}

function isDueOrHardReview(item: CardDeckItemDto, nowMs: number): boolean {
  if (item.reviewDifficulty === CARD_REVIEW_DIFFICULTIES.hard) return true;
  if (!item.nextReviewAt) return false;
  const nextReviewMs = Date.parse(item.nextReviewAt);
  return Number.isFinite(nextReviewMs) && nextReviewMs <= nowMs;
}

function getExamPriority(item: CardDeckItemDto): number {
  if (item.reviewDifficulty) return REVIEW_PRIORITY[item.reviewDifficulty];
  return 1;
}

function getLastReviewedMs(item: CardDeckItemDto): number {
  if (!item.lastReviewedAt) return 0;
  const parsed = Date.parse(item.lastReviewedAt);
  return Number.isFinite(parsed) ? parsed : 0;
}

function limitQueue(
  items: readonly CardDeckItemDto[],
  minutes: FocusDeskSessionMinutes
): CardDeckItemDto[] {
  return items.slice(0, minutes);
}

export function buildFocusDeskStudyQueue({
  items,
  minutes,
  mode,
  now = new Date(),
}: {
  items: readonly CardDeckItemDto[];
  minutes: FocusDeskSessionMinutes;
  mode: FocusDeskMode;
  now?: Date;
}): CardDeckItemDto[] {
  if (items.length === 0) return [];

  if (mode === FOCUS_DESK_MODES.all) {
    return limitQueue(items, minutes);
  }

  if (mode === FOCUS_DESK_MODES.review) {
    const nowMs = now.getTime();
    const dueItems = items.filter((item) => isDueOrHardReview(item, nowMs));
    return limitQueue(dueItems.length > 0 ? dueItems : items, minutes);
  }

  const prioritizedItems = items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const priorityDelta = getExamPriority(a.item) - getExamPriority(b.item);
      if (priorityDelta !== 0) return priorityDelta;

      const reviewedDelta =
        getLastReviewedMs(a.item) - getLastReviewedMs(b.item);
      return reviewedDelta !== 0 ? reviewedDelta : a.index - b.index;
    })
    .map(({ item }) => item);

  return limitQueue(prioritizedItems, minutes);
}

export function createFocusDeskSummary({
  endedAt,
  plannedMinutes,
  startedAt,
  stats,
}: {
  endedAt: Date;
  plannedMinutes: FocusDeskSessionMinutes;
  startedAt: Date;
  stats: FocusDeskReviewStats;
}): FocusDeskSummary {
  const elapsedSeconds = Math.max(
    0,
    Math.round((endedAt.getTime() - startedAt.getTime()) / 1000)
  );

  return {
    ...stats,
    plannedMinutes,
    elapsedSeconds,
  };
}
