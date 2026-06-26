export function parseCardDeckPlayIndexParam(param: string | null): number {
  const parsed = Number.parseInt(param ?? "", 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

export function clampCardDeckPlayIndex(index: number, itemCount: number) {
  if (itemCount <= 0) return 0;
  if (index < 0) return 0;
  if (index >= itemCount) return itemCount - 1;
  return index;
}

export function canMoveToPreviousCardDeckPlayItem(input: {
  currentIndex: number;
  itemCount: number;
}) {
  return input.itemCount > 0 && input.currentIndex > 0;
}

export function canMoveToNextCardDeckPlayItem(input: {
  currentIndex: number;
  itemCount: number;
}) {
  return input.itemCount > 0 && input.currentIndex < input.itemCount - 1;
}

export function resolveNextReviewCardDeckPlayIndex(input: {
  currentIndex: number;
  itemCount: number;
}) {
  if (input.itemCount <= 0) return 0;
  return input.currentIndex + 1 >= input.itemCount ? 0 : input.currentIndex + 1;
}

export function canSubmitCardDeckReview(input: {
  currentItemId: string | null | undefined;
  isAnswerVisible: boolean;
  isSaving: boolean;
}) {
  return Boolean(
    input.currentItemId && input.isAnswerVisible && !input.isSaving
  );
}
