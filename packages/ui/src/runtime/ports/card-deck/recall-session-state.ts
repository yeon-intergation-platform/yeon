import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";

export type CardRecallCompletion = {
  score: number | null;
};

export type CardRecallCompletionByCardId = Record<string, CardRecallCompletion>;

type CardRecallIdentityItem = Pick<
  CardDeckItemDto,
  "id" | "frontText" | "backText" | "imageStorageKey" | "imageUrl"
>;

export function createCardRecallSessionIdentity(
  deckId: string | null | undefined,
  cards: readonly CardRecallIdentityItem[]
): string {
  return JSON.stringify([
    deckId ?? null,
    cards.map(({ id, frontText, backText, imageStorageKey, imageUrl }) => [
      id,
      frontText,
      backText,
      imageStorageKey ?? null,
      imageUrl ?? null,
    ]),
  ]);
}

export function shouldApplyCardRecallResponse(
  submittedSessionIdentity: string,
  currentSessionIdentity: string
): boolean {
  return submittedSessionIdentity === currentSessionIdentity;
}

export function summarizeCardRecallCompletions(
  completionByCardId: CardRecallCompletionByCardId
): { averageScore: number | null; solvedCount: number } {
  const completions = Object.values(completionByCardId);
  const scores = completions.flatMap(({ score }) =>
    score === null ? [] : [score]
  );
  return {
    averageScore:
      scores.length === 0
        ? null
        : Math.round(
            scores.reduce((total, score) => total + score, 0) / scores.length
          ),
    solvedCount: completions.length,
  };
}
