import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireAuthenticatedUser = vi.fn();
const mockCreateCardDeckItemInSpring = vi.fn();
const mockCreateCardDeckItemsInSpring = vi.fn();
const mockUpdateCardDeckItemInSpring = vi.fn();
const mockDeleteCardDeckItemInSpring = vi.fn();
const mockReviewCardDeckItemInSpring = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) =>
    mockRequireAuthenticatedUser(...args),
}));

vi.mock("@/server/card-decks-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/card-decks-spring-client")
  >("@/server/card-decks-spring-client");
  return {
    ...actual,
    createCardDeckItemInSpring: (...args: unknown[]) =>
      mockCreateCardDeckItemInSpring(...args),
    createCardDeckItemsInSpring: (...args: unknown[]) =>
      mockCreateCardDeckItemsInSpring(...args),
    updateCardDeckItemInSpring: (...args: unknown[]) =>
      mockUpdateCardDeckItemInSpring(...args),
    deleteCardDeckItemInSpring: (...args: unknown[]) =>
      mockDeleteCardDeckItemInSpring(...args),
    reviewCardDeckItemInSpring: (...args: unknown[]) =>
      mockReviewCardDeckItemInSpring(...args),
  };
});
import { POST as itemsPost } from "../route";
import { DELETE as itemDelete, PATCH as itemPatch } from "../[itemId]/route";
import { POST as reviewPost } from "../[itemId]/review/route";
import { POST as bulkPost } from "../bulk/route";

describe("card-decks items routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
  });

  it("POST /items는 spring create를 호출한다", async () => {
    mockCreateCardDeckItemInSpring.mockResolvedValue({ item: { id: "dki_1" } });
    const response = await itemsPost(
      new NextRequest("http://localhost/api/v1/card-decks/dck_1/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ frontText: "앞면", backText: "뒷면" }),
      }),
      { params: Promise.resolve({ deckId: "dck_1" }) }
    );
    expect(response.status).toBe(201);
    expect(mockCreateCardDeckItemInSpring).toHaveBeenCalledWith(
      "user-1",
      "dck_1",
      { frontText: "앞면", backText: "뒷면" }
    );
  });

  it("POST /items/bulk는 spring bulk create를 호출한다", async () => {
    mockCreateCardDeckItemsInSpring.mockResolvedValue({
      items: [{ id: "dki_1" }],
    });
    const response = await bulkPost(
      new NextRequest("http://localhost/api/v1/card-decks/dck_1/items/bulk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: [{ frontText: "앞", backText: "뒤" }] }),
      }),
      { params: Promise.resolve({ deckId: "dck_1" }) }
    );
    expect(response.status).toBe(201);
    expect(mockCreateCardDeckItemsInSpring).toHaveBeenCalledWith(
      "user-1",
      "dck_1",
      { items: [{ frontText: "앞", backText: "뒤" }] }
    );
  });

  it("PATCH /items/[itemId]는 spring update를 호출한다", async () => {
    mockUpdateCardDeckItemInSpring.mockResolvedValue({ item: { id: "dki_1" } });
    const response = await itemPatch(
      new NextRequest("http://localhost/api/v1/card-decks/dck_1/items/dki_1", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ frontText: "수정" }),
      }),
      { params: Promise.resolve({ deckId: "dck_1", itemId: "dki_1" }) }
    );
    expect(response.status).toBe(200);
    expect(mockUpdateCardDeckItemInSpring).toHaveBeenCalledWith(
      "user-1",
      "dck_1",
      "dki_1",
      { frontText: "수정" }
    );
  });

  it("DELETE /items/[itemId]는 spring delete 후 204를 반환한다", async () => {
    mockDeleteCardDeckItemInSpring.mockResolvedValue({ ok: true });
    const response = await itemDelete(
      new NextRequest("http://localhost/api/v1/card-decks/dck_1/items/dki_1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ deckId: "dck_1", itemId: "dki_1" }) }
    );
    expect(response.status).toBe(204);
  });

  it("POST /review는 spring review를 호출한다", async () => {
    mockReviewCardDeckItemInSpring.mockResolvedValue({
      item: { id: "dki_1", reviewDifficulty: "good" },
    });
    const response = await reviewPost(
      new NextRequest(
        "http://localhost/api/v1/card-decks/dck_1/items/dki_1/review",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ difficulty: "good" }),
        }
      ),
      { params: Promise.resolve({ deckId: "dck_1", itemId: "dki_1" }) }
    );
    expect(response.status).toBe(200);
    expect(mockReviewCardDeckItemInSpring).toHaveBeenCalledWith(
      "user-1",
      "dck_1",
      "dki_1",
      { difficulty: "good" }
    );
  });
});
