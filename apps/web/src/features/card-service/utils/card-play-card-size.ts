import {
  readYeonLocalStorageItem,
  writeYeonLocalStorageItem,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

export interface CardPlayCardSize {
  width: number;
  height: number;
}

export const DEFAULT_CARD_PLAY_CARD_SIZE: CardPlayCardSize = {
  width: 720,
  height: 380,
};

export const CARD_PLAY_CARD_SIZE_LIMITS = {
  minWidth: 320,
  maxWidth: 1100,
  minHeight: 260,
  maxHeight: 820,
} as const;

const CARD_PLAY_CARD_SIZE_STORAGE_PREFIX = "card-service/play-card-size";

export function getCardPlayCardSizeStorageKey(deckId: string): string {
  return `${CARD_PLAY_CARD_SIZE_STORAGE_PREFIX}/${deckId}`;
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return Math.round(value);
}

export function clampCardPlayCardSize(
  size: CardPlayCardSize
): CardPlayCardSize {
  return {
    width: clampNumber(
      size.width,
      CARD_PLAY_CARD_SIZE_LIMITS.minWidth,
      CARD_PLAY_CARD_SIZE_LIMITS.maxWidth
    ),
    height: clampNumber(
      size.height,
      CARD_PLAY_CARD_SIZE_LIMITS.minHeight,
      CARD_PLAY_CARD_SIZE_LIMITS.maxHeight
    ),
  };
}

function isCardPlayCardSize(value: unknown): value is CardPlayCardSize {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CardPlayCardSize>;
  return (
    typeof candidate.width === "number" &&
    typeof candidate.height === "number" &&
    Number.isFinite(candidate.width) &&
    Number.isFinite(candidate.height)
  );
}

export function parseCardPlayCardSize(raw: string | null): CardPlayCardSize {
  if (!raw) return DEFAULT_CARD_PLAY_CARD_SIZE;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isCardPlayCardSize(parsed)) return DEFAULT_CARD_PLAY_CARD_SIZE;
    return clampCardPlayCardSize(parsed);
  } catch {
    return DEFAULT_CARD_PLAY_CARD_SIZE;
  }
}

export function readStoredCardPlayCardSize(deckId: string): CardPlayCardSize {
  return parseCardPlayCardSize(
    readYeonLocalStorageItem(getCardPlayCardSizeStorageKey(deckId))
  );
}

export function writeStoredCardPlayCardSize(
  deckId: string,
  size: CardPlayCardSize
): CardPlayCardSize {
  const normalized = clampCardPlayCardSize(size);
  writeYeonLocalStorageItem(
    getCardPlayCardSizeStorageKey(deckId),
    JSON.stringify(normalized)
  );
  return normalized;
}
