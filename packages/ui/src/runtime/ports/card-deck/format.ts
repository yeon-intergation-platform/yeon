// 카드 덱 표시 포맷 SSOT (parity: identical-value).
//
// "카드 N장 · 업데이트 YYYY년 M월 D일" 메타 문자열을 web/mobile가 각각 만들지 않도록 한곳에서 파생한다.
// (이전 drift: web long "2026년 6월 3일" ↔ mobile 2-digit "2026. 06. 03.")
// canonical 날짜 포맷 = 한국어 long. 레지스트리: docs/architecture/universal-ui-parity-registry.yaml
import type { CardDeckDto } from "@yeon/api-contract/card-decks";

const DECK_UPDATED_DATE_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatYeonCardDeckUpdatedDate(iso: string): string {
  return DECK_UPDATED_DATE_FORMAT.format(new Date(iso));
}

export function formatCardDeckMeta(deck: CardDeckDto): string {
  return `카드 ${deck.itemCount}장 · 업데이트 ${formatYeonCardDeckUpdatedDate(
    deck.updatedAt
  )}`;
}
