import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import {
  TYPING_DECK_LANGUAGE_TAGS,
  TYPING_DECK_SOURCE,
  TYPING_DECK_VISIBILITY,
  type TypingDeckDto,
} from "@yeon/api-contract/typing-decks";

import { DEFAULT_TYPING_DECKS } from "@/server/services/default-typing-decks";

import { GET } from "../route";

const EXPECTED_DEFAULT_DECKS = [
  { id: "default-ko-azaleas", title: "진달래꽃 (시집)", languageTag: TYPING_DECK_LANGUAGE_TAGS.ko },
  { id: "default-en-art-of-war-giles", title: "손자병법 / The Art of War", languageTag: TYPING_DECK_LANGUAGE_TAGS.en },
  { id: "default-en-shakespeare-sonnets", title: "Shakespeare’s Sonnets", languageTag: TYPING_DECK_LANGUAGE_TAGS.en },
  { id: "default-en-lincoln-addresses", title: "Lincoln’s Addresses", languageTag: TYPING_DECK_LANGUAGE_TAGS.en },
] as const;

const REMOVED_GENERATED_DEFAULT_DECK_IDS = [
  "default-ko-daily-rhythm",
  "default-en-flow-basics",
] as const;

function expectedDecksForLanguage(languageTag: "ko" | "en") {
  return EXPECTED_DEFAULT_DECKS.filter(
    (deck) =>
      deck.languageTag === languageTag ||
      deck.languageTag === TYPING_DECK_LANGUAGE_TAGS.mixed,
  );
}

function defaultDecksForLanguage(languageTag: "ko" | "en") {
  return DEFAULT_TYPING_DECKS.filter(
    (deck) =>
      deck.languageTag === languageTag ||
      deck.languageTag === TYPING_DECK_LANGUAGE_TAGS.mixed,
  );
}

async function listDefaultDecks(languageTag: "ko" | "en") {
  const response = await GET(
    new NextRequest(
      `http://localhost/api/v1/typing-decks?scope=default&languageTag=${languageTag}`,
    ),
  );

  expect(response.status).toBe(200);
  const body = (await response.json()) as { decks: TypingDeckDto[] };
  return body.decks;
}

describe("api/v1/typing-decks route default catalog", () => {
  it("GET exposes the Korean source-backed default decks with exact passage counts", async () => {
    const decks = await listDefaultDecks(TYPING_DECK_LANGUAGE_TAGS.ko);
    const expectedDecks = expectedDecksForLanguage(TYPING_DECK_LANGUAGE_TAGS.ko);

    expect(DEFAULT_TYPING_DECKS).toHaveLength(4);
    expect(decks).toHaveLength(expectedDecks.length);
    expect(decks.map((deck) => deck.id)).toEqual(
      expectedDecks.map((deck) => deck.id),
    );
    expect(decks.map((deck) => deck.title)).toEqual(
      expectedDecks.map((deck) => deck.title),
    );
    expect(defaultDecksForLanguage(TYPING_DECK_LANGUAGE_TAGS.en).map((deck) => deck.id)).toEqual(
      expectedDecks.map((deck) => deck.id),
    );
    expect(defaultDecksForLanguage(TYPING_DECK_LANGUAGE_TAGS.ko).map((deck) => deck.id)).toEqual(
      expectedDecks.map((deck) => deck.id),
    );
    expect(decks.map((deck) => deck.id)).not.toEqual(
      expect.arrayContaining([...REMOVED_GENERATED_DEFAULT_DECK_IDS]),
    );
    expect(
      decks.every(
        (deck) =>
          deck.source === TYPING_DECK_SOURCE.default &&
          deck.visibility === TYPING_DECK_VISIBILITY.public &&
          deck.canEdit === false &&
          deck.passageCount === 20,
      ),
    ).toBe(true);
  });

  it("GET exposes the English source-backed default decks with exact passage counts", async () => {
    const decks = await listDefaultDecks(TYPING_DECK_LANGUAGE_TAGS.en);
    const expectedDecks = expectedDecksForLanguage(TYPING_DECK_LANGUAGE_TAGS.en);

    expect(DEFAULT_TYPING_DECKS).toHaveLength(4);
    expect(decks).toHaveLength(expectedDecks.length);
    expect(decks.map((deck) => deck.id)).toEqual(
      expectedDecks.map((deck) => deck.id),
    );
    expect(decks.map((deck) => deck.title)).toEqual(
      expectedDecks.map((deck) => deck.title),
    );
    expect(decks.map((deck) => deck.id)).not.toEqual(
      expect.arrayContaining([...REMOVED_GENERATED_DEFAULT_DECK_IDS]),
    );
    expect(
      decks.every(
        (deck) =>
          deck.source === TYPING_DECK_SOURCE.default &&
          deck.visibility === TYPING_DECK_VISIBILITY.public &&
          deck.canEdit === false &&
          deck.passageCount === 20,
      ),
    ).toBe(true);
  });
});
