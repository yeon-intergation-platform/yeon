import {
  CARD_REVIEW_DIFFICULTIES,
  type CardReviewDifficulty,
} from "@yeon/api-contract/card-decks";

interface CardReviewShortcutKeyboardEvent {
  code: string;
  key: string;
}

const CARD_REVIEW_SKIP_SHORTCUT_CODE = "KeyS";
const CARD_REVIEW_SKIP_SHORTCUT_KEY = "s";
const CARD_REVIEW_REVEAL_SHORTCUT_CODE = "Space";
const CARD_REVIEW_REVEAL_SHORTCUT_KEY = " ";

const CARD_REVIEW_DIFFICULTY_SHORTCUT_BY_CODE: Record<
  string,
  CardReviewDifficulty
> = {
  Digit1: CARD_REVIEW_DIFFICULTIES.hard,
  Digit2: CARD_REVIEW_DIFFICULTIES.good,
  Digit3: CARD_REVIEW_DIFFICULTIES.easy,
  Numpad1: CARD_REVIEW_DIFFICULTIES.hard,
  Numpad2: CARD_REVIEW_DIFFICULTIES.good,
  Numpad3: CARD_REVIEW_DIFFICULTIES.easy,
};

const CARD_REVIEW_DIFFICULTY_SHORTCUT_BY_KEY: Record<
  string,
  CardReviewDifficulty
> = {
  "1": CARD_REVIEW_DIFFICULTIES.hard,
  "2": CARD_REVIEW_DIFFICULTIES.good,
  "3": CARD_REVIEW_DIFFICULTIES.easy,
};

export function isCardReviewSkipShortcut(
  event: CardReviewShortcutKeyboardEvent
) {
  return (
    event.code === CARD_REVIEW_SKIP_SHORTCUT_CODE ||
    event.key.toLowerCase() === CARD_REVIEW_SKIP_SHORTCUT_KEY
  );
}

export function isCardReviewRevealShortcut(
  event: CardReviewShortcutKeyboardEvent
) {
  return (
    event.code === CARD_REVIEW_REVEAL_SHORTCUT_CODE ||
    event.key === CARD_REVIEW_REVEAL_SHORTCUT_KEY
  );
}

export function resolveCardReviewDifficultyShortcut(
  event: CardReviewShortcutKeyboardEvent
) {
  return (
    CARD_REVIEW_DIFFICULTY_SHORTCUT_BY_CODE[event.code] ??
    CARD_REVIEW_DIFFICULTY_SHORTCUT_BY_KEY[event.key] ??
    null
  );
}
