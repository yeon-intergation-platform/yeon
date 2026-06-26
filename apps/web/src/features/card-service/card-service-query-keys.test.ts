import { cardDeckQueryKeys } from "@yeon/ui/runtime/ports/card-deck";
import { describe, expect, it } from "vitest";

import { cardServiceQueryKeys } from "./card-service-query-keys";

describe("cardServiceQueryKeys", () => {
  it("re-exports the card deck query key SSOT for web/mobile parity", () => {
    expect(cardServiceQueryKeys.decks).toBe(cardDeckQueryKeys.list);
    expect(cardServiceQueryKeys.deckDetail).toBe(cardDeckQueryKeys.detail);
    expect(cardServiceQueryKeys.decks(true)).toEqual([
      "card-service",
      "decks",
      "server",
    ]);
    expect(cardServiceQueryKeys.deckDetail(false, "deck-1")).toEqual([
      "card-service",
      "decks",
      "guest",
      "deck-1",
    ]);
  });
});
