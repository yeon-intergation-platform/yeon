import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET } from "../route";

describe("api/v1/typing-decks route default catalog", () => {
  it("GET exposes Korean default decks with at least 100 passages", async () => {
    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/typing-decks?scope=default&languageTag=ko",
      ),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    const koreanDeck = body.decks.find(
      (deck: { id: string }) => deck.id === "default-ko-daily-rhythm",
    );

    expect(koreanDeck?.passageCount).toBeGreaterThanOrEqual(100);
  });

  it("GET exposes English default decks with at least 100 passages", async () => {
    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/typing-decks?scope=default&languageTag=en",
      ),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    const englishDeck = body.decks.find(
      (deck: { id: string }) => deck.id === "default-en-flow-basics",
    );

    expect(englishDeck?.passageCount).toBeGreaterThanOrEqual(100);
  });
});
