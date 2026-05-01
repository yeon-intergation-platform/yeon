import { describe, expect, it } from "vitest";

import { resolveTypingRoomSelectedDeck } from "./typing-room-selection";
import type { TypingDeckOption } from "./use-typing-settings";

const OLD_KO_DEFAULT_ID = "default-ko-daily-rhythm";

const fallbackDeck: TypingDeckOption = {
  id: "local-default-ko",
  title: "기본 타자 문장",
  languageTag: "ko",
  visibility: "default",
  source: "default",
};

const newDefaultDeck: TypingDeckOption = {
  id: "default-ko-source",
  title: "Verified source deck",
  languageTag: "ko",
  visibility: "default",
  source: "default",
};

describe("resolveTypingRoomSelectedDeck", () => {
  it("keeps stale room query selectedDeckId unresolved so the race-seed 404 path can show manual fallback", () => {
    const selectedDeck = resolveTypingRoomSelectedDeck(
      OLD_KO_DEFAULT_ID,
      [fallbackDeck, newDefaultDeck],
      fallbackDeck,
      "ko",
    );

    expect(selectedDeck).toEqual({
      id: OLD_KO_DEFAULT_ID,
      title: "선택한 덱",
      languageTag: "ko",
      visibility: "public",
    });
  });

  it("uses the stored local/default deck when no query selectedDeckId is provided", () => {
    expect(
      resolveTypingRoomSelectedDeck(
        undefined,
        [fallbackDeck, newDefaultDeck],
        fallbackDeck,
        "ko",
      ),
    ).toBe(fallbackDeck);
  });
});
