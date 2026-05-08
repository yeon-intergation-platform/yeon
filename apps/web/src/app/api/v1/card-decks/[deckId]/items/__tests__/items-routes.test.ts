import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { cardDeckItemDtoSchema } from "@yeon/api-contract/card-decks";
import { ServiceError } from "@/server/services/service-error";

const mockRequireAuthenticatedUser = vi.fn();
const mockCreateCardDeckItem = vi.fn();
const mockUpdateCardDeckItem = vi.fn();
const mockDeleteCardDeckItem = vi.fn();
const mockReviewCardDeckItem = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) =>
    mockRequireAuthenticatedUser(...args),
}));

vi.mock("@/server/services/card-decks-service", () => ({
  createCardDeckItem: (...args: unknown[]) => mockCreateCardDeckItem(...args),
  updateCardDeckItem: (...args: unknown[]) => mockUpdateCardDeckItem(...args),
  deleteCardDeckItem: (...args: unknown[]) => mockDeleteCardDeckItem(...args),
  reviewCardDeckItem: (...args: unknown[]) => mockReviewCardDeckItem(...args),
}));

import { POST as itemsPost } from "../route";
import { DELETE as itemDelete, PATCH as itemPatch } from "../[itemId]/route";
import { POST as reviewPost } from "../[itemId]/review/route";

const sampleItem = cardDeckItemDtoSchema.parse({
  id: "item-1",
  frontText: "앞면",
  backText: "뒷면",
  imageStorageKey: null,
  imageUrl: null,
  reviewDifficulty: null,
  lastReviewedAt: null,
  nextReviewAt: null,
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
});

describe("card-decks items routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
  });

  it("POST /items: contract 위반(frontText 누락)이면 400과 한국어 에러 메시지를 반환한다", async () => {
    const response = await itemsPost(
      new NextRequest("http://localhost/api/v1/card-decks/deck-1/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ backText: "뒷면만 있음" }),
      }),
      { params: Promise.resolve({ deckId: "deck-1" }) }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "요청 데이터가 올바르지 않습니다.",
    });
    expect(mockCreateCardDeckItem).not.toHaveBeenCalled();
  });

  it("PATCH /items/[itemId]: 비소유자(service ServiceError 404)면 404를 반환한다", async () => {
    mockUpdateCardDeckItem.mockRejectedValue(
      new ServiceError(404, "카드를 찾지 못했습니다.")
    );

    const response = await itemPatch(
      new NextRequest(
        "http://localhost/api/v1/card-decks/deck-1/items/item-999",
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ frontText: "수정 시도" }),
        }
      ),
      { params: Promise.resolve({ deckId: "deck-1", itemId: "item-999" }) }
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "카드를 찾지 못했습니다.",
    });
    expect(mockUpdateCardDeckItem).toHaveBeenCalledWith(
      "user-1",
      "deck-1",
      "item-999",
      { frontText: "수정 시도" }
    );
  });

  it("DELETE /items/[itemId]: 존재하지 않는 itemId(service ServiceError 404)면 404를 반환한다", async () => {
    mockDeleteCardDeckItem.mockRejectedValue(
      new ServiceError(404, "카드를 찾지 못했습니다.")
    );

    const response = await itemDelete(
      new NextRequest(
        "http://localhost/api/v1/card-decks/deck-1/items/item-missing",
        { method: "DELETE" }
      ),
      { params: Promise.resolve({ deckId: "deck-1", itemId: "item-missing" }) }
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "카드를 찾지 못했습니다.",
    });
    expect(mockDeleteCardDeckItem).toHaveBeenCalledWith(
      "user-1",
      "deck-1",
      "item-missing"
    );
  });

  it("POST /items/[itemId]/review: service.reviewCardDeckItem을 호출하고 { item } 형태로 응답한다", async () => {
    mockReviewCardDeckItem.mockResolvedValue(sampleItem);

    const response = await reviewPost(
      new NextRequest(
        "http://localhost/api/v1/card-decks/deck-1/items/item-1/review",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ difficulty: "good" }),
        }
      ),
      { params: Promise.resolve({ deckId: "deck-1", itemId: "item-1" }) }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ item: sampleItem });
    expect(mockReviewCardDeckItem).toHaveBeenCalledWith(
      "user-1",
      "deck-1",
      "item-1",
      "good"
    );
  });

  it("POST /items: 정상 흐름은 201과 cardDeckItemDto 스키마를 만족하는 { item } 본문을 반환한다", async () => {
    mockCreateCardDeckItem.mockResolvedValue(sampleItem);

    const response = await itemsPost(
      new NextRequest("http://localhost/api/v1/card-decks/deck-1/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ frontText: "앞면", backText: "뒷면" }),
      }),
      { params: Promise.resolve({ deckId: "deck-1" }) }
    );

    expect(response.status).toBe(201);
    const body = (await response.json()) as { item: unknown };
    expect(body).toEqual({ item: sampleItem });
    expect(cardDeckItemDtoSchema.safeParse(body.item).success).toBe(true);
    expect(mockCreateCardDeckItem).toHaveBeenCalledWith("user-1", "deck-1", {
      frontText: "앞면",
      backText: "뒷면",
    });
  });

  it("PATCH /items/[itemId]: 정상 흐름은 200과 { item } 본문을 반환한다", async () => {
    const updatedItem = { ...sampleItem, frontText: "수정된 앞면" };
    mockUpdateCardDeckItem.mockResolvedValue(updatedItem);

    const response = await itemPatch(
      new NextRequest(
        "http://localhost/api/v1/card-decks/deck-1/items/item-1",
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ frontText: "수정된 앞면" }),
        }
      ),
      { params: Promise.resolve({ deckId: "deck-1", itemId: "item-1" }) }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ item: updatedItem });
    expect(mockUpdateCardDeckItem).toHaveBeenCalledWith(
      "user-1",
      "deck-1",
      "item-1",
      { frontText: "수정된 앞면" }
    );
  });

  it("DELETE /items/[itemId]: 정상 흐름은 204와 본문 없음을 반환한다", async () => {
    mockDeleteCardDeckItem.mockResolvedValue(undefined);

    const response = await itemDelete(
      new NextRequest(
        "http://localhost/api/v1/card-decks/deck-1/items/item-1",
        { method: "DELETE" }
      ),
      { params: Promise.resolve({ deckId: "deck-1", itemId: "item-1" }) }
    );

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(mockDeleteCardDeckItem).toHaveBeenCalledWith(
      "user-1",
      "deck-1",
      "item-1"
    );
  });

  it("POST /items/[itemId]/review: Zod 위반(잘못된 difficulty enum)은 400을 반환하고 service를 호출하지 않는다", async () => {
    const response = await reviewPost(
      new NextRequest(
        "http://localhost/api/v1/card-decks/deck-1/items/item-1/review",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ difficulty: "impossible" }),
        }
      ),
      { params: Promise.resolve({ deckId: "deck-1", itemId: "item-1" }) }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "복습 결과 형식이 올바르지 않습니다.",
    });
    expect(mockReviewCardDeckItem).not.toHaveBeenCalled();
  });
});
