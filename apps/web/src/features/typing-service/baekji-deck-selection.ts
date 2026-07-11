import type { CardDeckDto } from "@yeon/api-contract/card-decks";

export function resolveBaekjiSelectedDeckId(
  requestedDeckId: string | null,
  decks: readonly Pick<CardDeckDto, "id">[]
) {
  return requestedDeckId && decks.some(({ id }) => id === requestedDeckId)
    ? requestedDeckId
    : "";
}
