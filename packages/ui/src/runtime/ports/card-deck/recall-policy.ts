import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";
import { getYeonHtmlVisibleText } from "../../../rich-content/YeonRichDom";

export const CARD_RECALL_EXCLUSION_REASONS = {
  missingQuestion: "missing-question",
  missingAnswer: "missing-answer",
  missingQuestionAndAnswer: "missing-question-and-answer",
} as const;

export type CardRecallExclusionReason =
  (typeof CARD_RECALL_EXCLUSION_REASONS)[keyof typeof CARD_RECALL_EXCLUSION_REASONS];

const ACCESSIBLE_MEDIA_TEXT_PATTERN =
  /\b(?:alt|title)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

function getAccessibleMediaText(value: string) {
  return Array.from(value.matchAll(ACCESSIBLE_MEDIA_TEXT_PATTERN), (match) =>
    (match[1] ?? match[2] ?? "").trim()
  )
    .filter(Boolean)
    .join(" ");
}

function hasRecallContent(value: string) {
  const normalized = value.trim();
  if (!normalized) return false;
  return Boolean(
    getYeonHtmlVisibleText(normalized) || getAccessibleMediaText(normalized)
  );
}

export function getCardRecallExclusionReason(
  item: Pick<CardDeckItemDto, "frontText" | "backText">
): CardRecallExclusionReason | null {
  const hasQuestion = hasRecallContent(item.frontText);
  const hasAnswer = hasRecallContent(item.backText);
  if (!hasQuestion && !hasAnswer) {
    return CARD_RECALL_EXCLUSION_REASONS.missingQuestionAndAnswer;
  }
  if (!hasQuestion) return CARD_RECALL_EXCLUSION_REASONS.missingQuestion;
  if (!hasAnswer) return CARD_RECALL_EXCLUSION_REASONS.missingAnswer;
  return null;
}

export function isCardRecallEligible(
  item: Pick<CardDeckItemDto, "frontText" | "backText">
) {
  return getCardRecallExclusionReason(item) === null;
}

export function partitionCardDeckItemsForRecall(
  items: readonly CardDeckItemDto[]
) {
  const eligibleItems: CardDeckItemDto[] = [];
  const excludedItems: CardDeckItemDto[] = [];
  for (const item of items) {
    (isCardRecallEligible(item) ? eligibleItems : excludedItems).push(item);
  }
  return { eligibleItems, excludedItems } as const;
}
