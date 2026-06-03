import { describe, expect, it } from "vitest";
import { cardServiceQueryKeys } from "./query-keys";

describe("cardServiceQueryKeys", () => {
  it("로그인/비로그인 키가 구분되어 캐시 분할된다", () => {
    // queryKey SSOT(card-deck/query-keys.ts)로 통일: 상세도 "decks" 네임스페이스 하위.
    expect(cardServiceQueryKeys.deck("deck-1", true)).toEqual([
      "card-service",
      "decks",
      "server",
      "deck-1",
    ]);

    expect(cardServiceQueryKeys.deck("deck-1", false)).toEqual([
      "card-service",
      "decks",
      "guest",
      "deck-1",
    ]);
  });

  it("decks 키도 서버/게스트 구분이 유지된다", () => {
    expect(cardServiceQueryKeys.decks(true)).toEqual([
      "card-service",
      "decks",
      "server",
    ]);
    expect(cardServiceQueryKeys.decks(false)).toEqual([
      "card-service",
      "decks",
      "guest",
    ]);
  });
});
