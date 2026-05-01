import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET } from "../route";

describe("api/v1/typing-decks/[deckId] default detail route", () => {
  it("GET exposes at least 100 Korean default passages", async () => {
    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/typing-decks/default-ko-daily-rhythm",
      ),
      { params: Promise.resolve({ deckId: "default-ko-daily-rhythm" }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.deck.passageCount).toBeGreaterThanOrEqual(100);
    expect(body.passages.length).toBeGreaterThanOrEqual(100);
  });

  it("GET exposes at least 100 English default passages", async () => {
    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/typing-decks/default-en-flow-basics",
      ),
      { params: Promise.resolve({ deckId: "default-en-flow-basics" }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.deck.passageCount).toBeGreaterThanOrEqual(100);
    expect(body.passages.length).toBeGreaterThanOrEqual(100);
  });
});
