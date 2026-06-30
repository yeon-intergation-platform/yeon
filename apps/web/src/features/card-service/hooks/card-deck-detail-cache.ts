import type {
  CardDeckDetailResponse,
  CardDeckItemDto,
} from "@yeon/api-contract/card-decks";

export function replaceCardDeckDetailItem(
  detail: CardDeckDetailResponse | undefined,
  updatedItem: CardDeckItemDto
) {
  if (!detail) return detail;

  return {
    ...detail,
    items: detail.items.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    ),
  };
}
