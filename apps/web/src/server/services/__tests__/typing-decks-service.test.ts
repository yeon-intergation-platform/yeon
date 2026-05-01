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
        passageId: "default-ko-daily-rhythm-01",
      },
    );

    expect(raceSeed.deckVisibility).toBe(TYPING_DECK_SOURCE.default);
    expect(raceSeed.lobbyDeckTitle).toBe(raceSeed.participantDeckTitle);
    expect(raceSeed.prompt.length).toBeGreaterThan(0);
  });
});
