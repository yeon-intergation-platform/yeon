import { describe, expect, it } from "vitest";

import { cardServiceQueryKeys } from "./query-keys";

describe("cardServiceQueryKeys", () => {
  it("로그인/비로그인 키가 구분되어 캐시 분할된다", () => {
    expect(cardServiceQueryKeys.deck("deck-1", true)).toEqual([
      "card-service",
      "deck",
      "server",
      "deck-1",
    ]);

    expect(cardServiceQueryKeys.deck("deck-1", false)).toEqual([
      "card-service",
      "deck",
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
