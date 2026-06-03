import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import {
  TYPING_DECK_SOURCE,
  TYPING_DECK_VISIBILITY,
  type TypingDeckDetailResponse,
} from "@yeon/api-contract/typing-decks";
import { DEFAULT_TYPING_DECKS } from "@/server/services/default-typing-decks";
import { GET } from "../route";

const EXPECTED_DEFAULT_DECKS = [
  { id: "default-ko-azaleas", title: "진달래꽃" },
  { id: "default-en-art-of-war-giles", title: "The Art of War" },
  { id: "default-en-shakespeare-sonnets", title: "Shakespeare’s Sonnets" },
  { id: "default-en-lincoln-addresses", title: "Lincoln’s Addresses" },
] as const;

const REMOVED_GENERATED_DEFAULT_DECK_IDS = new Set([
  "default-ko-daily-rhythm",
  "default-en-flow-basics",
]);

describe("api/v1/typing-decks/[deckId] default detail route", () => {
  it("GET exposes final default deck details with source-backed metadata", async () => {
    expect(DEFAULT_TYPING_DECKS).toHaveLength(4);
    expect(
      DEFAULT_TYPING_DECKS.map((deck) => ({
        id: deck.id,
        title: deck.title,
      }))
    ).toEqual([...EXPECTED_DEFAULT_DECKS]);

    for (const expectedDeck of DEFAULT_TYPING_DECKS) {
      expect(REMOVED_GENERATED_DEFAULT_DECK_IDS.has(expectedDeck.id)).toBe(
        false
      );

      const response = await GET(
        new NextRequest(
          `http://localhost/api/v1/typing-decks/${expectedDeck.id}`
        ),
        { params: Promise.resolve({ deckId: expectedDeck.id }) }
      );

      expect(response.status).toBe(200);
      const body = (await response.json()) as TypingDeckDetailResponse;

      expect(body.deck).toMatchObject({
        id: expectedDeck.id,
        title: expectedDeck.title,
        source: TYPING_DECK_SOURCE.default,
        visibility: TYPING_DECK_VISIBILITY.public,
        canEdit: false,
        passageCount: 20,
      });
      expect(body.passages).toHaveLength(20);
      expect(body.passages.map((passage) => passage.id)).toEqual(
        expectedDeck.passages.map((passage) => passage.id)
      );
      expect(new Set(body.passages.map((passage) => passage.prompt)).size).toBe(
        20
      );
    }
  });
});
