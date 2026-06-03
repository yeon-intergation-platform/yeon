import { describe, expect, it, vi } from "vitest";
import {
  getSelectedTypingDeckForLanguage,
  resolveTypingRaceSeed,
  type TypingDeckOption,
  type TypingSettings,
} from "./use-typing-settings";

const OLD_KO_DEFAULT_ID = "default-ko-daily-rhythm";
const OLD_EN_DEFAULT_ID = "default-en-flow-basics";

function remoteDeck(overrides: Partial<TypingDeckOption>): TypingDeckOption {
  return {
    id: "default-new-source-deck",
    title: "New source deck",
    languageTag: "ko",
    visibility: "default",
    source: "default",
    ...overrides,
  };
}

describe("typing default deck compatibility", () => {
  it("falls back to the local deck when persisted selectedDeckIdsByLanguage points at removed defaults", () => {
    const persistedSettings: TypingSettings = {
      locale: "ko",
      selectedDeckIdsByLanguage: {
        ko: OLD_KO_DEFAULT_ID,
        en: OLD_EN_DEFAULT_ID,
      },
    };

    const koSelection = getSelectedTypingDeckForLanguage(
      persistedSettings,
      [remoteDeck({ id: "default-ko-source", languageTag: "ko" })],
      "ko"
    );
    const enSelection = getSelectedTypingDeckForLanguage(
      persistedSettings,
      [remoteDeck({ id: "default-en-source", languageTag: "en" })],
      "en"
    );

    expect(koSelection.selectedDeckId).toBe(OLD_KO_DEFAULT_ID);
    expect(koSelection.selectedDeck.id).toBe("local-default-ko");
    expect(koSelection.selectedDeck.title).toBe("기본 타자 문장");
    expect(enSelection.selectedDeckId).toBe(OLD_EN_DEFAULT_ID);
    expect(enSelection.selectedDeck.id).toBe("local-default-en");
    expect(enSelection.selectedDeck.title).toBe("Default local passages");
  });

  it("returns a manual-fallback error when stale room query deck IDs 404 at race seed creation", async () => {
    const staleDeck = remoteDeck({
      id: OLD_KO_DEFAULT_ID,
      title: "선택한 덱",
      languageTag: "ko",
      visibility: "public",
      source: "user",
    });
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ error: "not found" }), { status: 404 })
      );

    const result = await resolveTypingRaceSeed(staleDeck, "ko");

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/v1/typing-decks/${OLD_KO_DEFAULT_ID}/race-seed`,
      expect.objectContaining({ method: "POST" })
    );
    expect(result).toEqual({
      ok: false,
      deck: staleDeck,
      message: "선택한 덱의 레이스 문장을 준비하지 못했어요.",
    });
  });
});
