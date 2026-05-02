import { describe, expect, it } from "vitest";

import {
  TYPING_DECK_LANGUAGE_TAGS,
  TYPING_DECK_SOURCE,
  TYPING_DECK_VISIBILITY,
} from "@yeon/api-contract/typing-decks";

import { DEFAULT_TYPING_DECKS } from "../default-typing-decks";
import {
  DEFAULT_TYPING_DECK_SOURCES,
  type DefaultTypingDeckSource,
} from "../default-typing-deck-sources";
import {
  createTypingRaceSeed,
  getTypingDeckDetail,
  listTypingDecks,
} from "../typing-decks-service";

const EXPECTED_DEFAULT_DECKS = [
  {
    id: "default-ko-azaleas",
    title: "진달래꽃",
    languageTag: TYPING_DECK_LANGUAGE_TAGS.ko,
  },
  {
    id: "default-en-art-of-war-giles",
    title: "The Art of War",
    languageTag: TYPING_DECK_LANGUAGE_TAGS.en,
  },
  {
    id: "default-en-shakespeare-sonnets",
    title: "Shakespeare’s Sonnets",
    languageTag: TYPING_DECK_LANGUAGE_TAGS.en,
  },
  {
    id: "default-en-lincoln-addresses",
    title: "Lincoln’s Addresses",
    languageTag: TYPING_DECK_LANGUAGE_TAGS.en,
  },
] as const;

const REMOVED_GENERATED_DEFAULT_DECK_IDS = new Set([
  "default-ko-daily-rhythm",
  "default-en-flow-basics",
]);

const ACCEPTED_RIGHTS_STATUSES = new Set([
  "green",
  "product-legal-accepted-yellow",
]);

function expectDeckShape() {
  expect(
    DEFAULT_TYPING_DECKS.map((deck) => ({
      id: deck.id,
      title: deck.title,
      languageTag: deck.languageTag,
    }))
  ).toEqual([...EXPECTED_DEFAULT_DECKS]);

  for (const deck of DEFAULT_TYPING_DECKS) {
    expect(REMOVED_GENERATED_DEFAULT_DECK_IDS.has(deck.id)).toBe(false);
    expect(deck.source).toBe(TYPING_DECK_SOURCE.default);
    expect(deck.visibility).toBe(TYPING_DECK_VISIBILITY.public);
    expect(deck.passages).toHaveLength(20);
    expect(deck.passages.map((passage) => passage.sortOrder)).toEqual(
      Array.from({ length: 20 }, (_, index) => index)
    );
    expect(new Set(deck.passages.map((passage) => passage.id)).size).toBe(20);
    expect(new Set(deck.passages.map((passage) => passage.prompt)).size).toBe(
      20
    );
  }
}

function expectManifestCoverage() {
  const sources =
    DEFAULT_TYPING_DECK_SOURCES as readonly DefaultTypingDeckSource[];
  const sourcesByDeckId = new Map(sources.map((source) => [source.id, source]));

  expect(sources).toHaveLength(DEFAULT_TYPING_DECKS.length);

  for (const deck of DEFAULT_TYPING_DECKS) {
    const source = sourcesByDeckId.get(deck.id);

    expect(source).toBeDefined();
    expect(source?.title).toBe(deck.title);
    expect(source?.sourceWorkTitle).toEqual(expect.any(String));
    expect(source?.sourceAuthor).toEqual(expect.any(String));
    expect(source?.sourceUrl).toMatch(/^https?:\/\//);
    expect(source?.licenseNotes).toEqual(expect.any(String));
    expect(ACCEPTED_RIGHTS_STATUSES.has(source?.rightsStatus ?? "")).toBe(true);

    const manifestPassageIds = source?.passages.map((passage) => passage.id);
    expect(manifestPassageIds).toEqual(
      deck.passages.map((passage) => passage.id)
    );
    expect(
      source?.passages.every(
        (passage) =>
          passage.sourceLocator.trim().length > 0 &&
          passage.cleanupNotes.trim().length > 0 &&
          (!passage.sourceUrl || /^https?:\/\//.test(passage.sourceUrl))
      )
    ).toBe(true);
  }
}

describe("typing-decks-service default decks", () => {
  it("lists Korean source-backed default decks for anonymous readers", async () => {
    expectDeckShape();

    const decks = await listTypingDecks(null, {
      scope: "default",
      languageTag: TYPING_DECK_LANGUAGE_TAGS.ko,
      includeDefaults: false,
    });
    const expectedDecks = DEFAULT_TYPING_DECKS.filter(
      (deck) =>
        deck.languageTag === TYPING_DECK_LANGUAGE_TAGS.ko ||
        deck.languageTag === TYPING_DECK_LANGUAGE_TAGS.mixed
    );

    expect(decks).toHaveLength(expectedDecks.length);
    expect(decks.map((deck) => deck.id)).toEqual(
      expectedDecks.map((deck) => deck.id)
    );
    expect(
      decks.every((deck) => deck.source === TYPING_DECK_SOURCE.default)
    ).toBe(true);
    expect(decks.every((deck) => deck.canEdit === false)).toBe(true);
    expect(decks.every((deck) => deck.passageCount === 20)).toBe(true);
  });

  it("lists English source-backed default decks for anonymous readers", async () => {
    expectDeckShape();

    const decks = await listTypingDecks(null, {
      scope: "default",
      languageTag: TYPING_DECK_LANGUAGE_TAGS.en,
      includeDefaults: false,
    });
    const expectedDecks = DEFAULT_TYPING_DECKS.filter(
      (deck) =>
        deck.languageTag === TYPING_DECK_LANGUAGE_TAGS.en ||
        deck.languageTag === TYPING_DECK_LANGUAGE_TAGS.mixed
    );

    expect(decks).toHaveLength(expectedDecks.length);
    expect(decks.map((deck) => deck.id)).toEqual(
      expectedDecks.map((deck) => deck.id)
    );
    expect(
      decks.every((deck) => deck.source === TYPING_DECK_SOURCE.default)
    ).toBe(true);
    expect(decks.every((deck) => deck.canEdit === false)).toBe(true);
    expect(decks.every((deck) => deck.passageCount === 20)).toBe(true);
  });

  it("exposes source manifest coverage for every default passage", () => {
    expectDeckShape();
    expectManifestCoverage();
  });

  it("returns default deck detail without authentication", async () => {
    expectDeckShape();

    for (const expectedDeck of DEFAULT_TYPING_DECKS) {
      const detail = await getTypingDeckDetail(null, expectedDeck.id);

      expect(detail.deck).toMatchObject({
        id: expectedDeck.id,
        title: expectedDeck.title,
        source: TYPING_DECK_SOURCE.default,
        visibility: TYPING_DECK_VISIBILITY.public,
        canEdit: false,
        passageCount: 20,
      });
      expect(detail.passages).toHaveLength(20);
      expect(detail.passages.map((passage) => passage.id)).toEqual(
        expectedDeck.passages.map((passage) => passage.id)
      );
      expect(
        new Set(detail.passages.map((passage) => passage.prompt)).size
      ).toBe(20);
    }
  });

  it("creates lobby-safe race seed metadata for every final default deck", async () => {
    expectDeckShape();

    for (const deck of DEFAULT_TYPING_DECKS) {
      const firstPassage = deck.passages[0]!;
      const raceSeed = await createTypingRaceSeed(null, deck.id, {
        passageId: firstPassage.id,
      });

      expect(raceSeed).toMatchObject({
        deckId: deck.id,
        passageId: firstPassage.id,
        prompt: firstPassage.prompt,
        deckVisibility: TYPING_DECK_SOURCE.default,
        lobbyDeckTitle: deck.title,
        participantDeckTitle: deck.title,
        languageTag: deck.languageTag,
      });
      expect(raceSeed.seedToken).toMatch(/^v1\./);
    }
  });
});
