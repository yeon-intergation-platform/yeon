import { describe, expect, it } from "vitest";

import {
  TYPING_DECK_LANGUAGE_TAGS,
  TYPING_DECK_SOURCE,
  TYPING_DECK_VISIBILITY,
} from "@yeon/api-contract/typing-decks";

import {
  createTypingRaceSeed,
  getTypingDeckDetail,
  listTypingDecks,
} from "../typing-decks-service";

describe("typing-decks-service default decks", () => {
  it("lists Korean default decks for anonymous readers", async () => {
    const decks = await listTypingDecks(null, {
      scope: "default",
      languageTag: TYPING_DECK_LANGUAGE_TAGS.ko,
      includeDefaults: false,
    });

    expect(decks.length).toBeGreaterThan(0);
    expect(
      decks.every((deck) => deck.source === TYPING_DECK_SOURCE.default),
    ).toBe(true);
    expect(decks.every((deck) => deck.canEdit === false)).toBe(true);
  });

  it("exposes at least 100 Korean default passages through list and detail", async () => {
    const decks = await listTypingDecks(null, {
      scope: "default",
      languageTag: TYPING_DECK_LANGUAGE_TAGS.ko,
      includeDefaults: false,
    });
    const koreanDeck = decks.find(
      (deck) => deck.id === "default-ko-daily-rhythm",
    );

    expect(koreanDeck?.passageCount).toBeGreaterThanOrEqual(100);

    const detail = await getTypingDeckDetail(null, "default-ko-daily-rhythm");
    expect(detail.passages).toHaveLength(koreanDeck!.passageCount);
    expect(detail.passages.length).toBeGreaterThanOrEqual(100);
    expect(new Set(detail.passages.map((passage) => passage.prompt)).size).toBe(
      detail.passages.length,
    );
  });

  it("exposes at least 100 English default passages through list and detail", async () => {
    const decks = await listTypingDecks(null, {
      scope: "default",
      languageTag: TYPING_DECK_LANGUAGE_TAGS.en,
      includeDefaults: false,
    });
    const englishDeck = decks.find(
      (deck) => deck.id === "default-en-flow-basics",
    );

    expect(englishDeck?.passageCount).toBeGreaterThanOrEqual(100);

    const detail = await getTypingDeckDetail(null, "default-en-flow-basics");
    expect(detail.passages).toHaveLength(englishDeck!.passageCount);
    expect(detail.passages.length).toBeGreaterThanOrEqual(100);
    expect(new Set(detail.passages.map((passage) => passage.prompt)).size).toBe(
      detail.passages.length,
    );
  });

  it("returns default deck detail without authentication", async () => {
    const detail = await getTypingDeckDetail(null, "default-en-flow-basics");

    expect(detail.deck.source).toBe(TYPING_DECK_SOURCE.default);
    expect(detail.deck.visibility).toBe(TYPING_DECK_VISIBILITY.public);
    expect(detail.passages.length).toBeGreaterThanOrEqual(3);
  });

  it("creates lobby-safe race seed metadata for default decks", async () => {
    const raceSeed = await createTypingRaceSeed(
      null,
      "default-ko-daily-rhythm",
      {
        passageId: "default-ko-daily-rhythm-001",
      },
    );

    expect(raceSeed.deckVisibility).toBe(TYPING_DECK_SOURCE.default);
    expect(raceSeed.lobbyDeckTitle).toBe(raceSeed.participantDeckTitle);
    expect(raceSeed.seedToken).toMatch(/^v1\./);
    expect(raceSeed.prompt.length).toBeGreaterThan(0);
  });
});
