import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  cardDeckDetailResponseSchema,
  type CardDeckDetailResponse,
} from "@yeon/api-contract/card-decks";

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    new Response(JSON.stringify({ message }), {
      status,
      headers: { "content-type": "application/json" },
    }),
  requireAuthenticatedUser: vi.fn(),
}));

vi.mock("@/server/services/card-decks-service", () => ({
  getCardDeckDetail: vi.fn(),
  updateCardDeck: vi.fn(),
  deleteCardDeck: vi.fn(),
}));

import { requireAuthenticatedUser } from "@/app/api/v1/counseling-records/_shared";
import {
  deleteCardDeck,
  getCardDeckDetail,
  updateCardDeck,
} from "@/server/services/card-decks-service";
import { ServiceError } from "@/server/services/service-error";

import { DELETE, GET, PATCH } from "../route";

const UNAUTHORIZED_RESPONSE = () =>
  new Response(JSON.stringify({ message: "로그인이 필요합니다." }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });

const mockAuthenticated = (userId = "user-1") => {
  vi.mocked(requireAuthenticatedUser).mockResolvedValue({
    currentUser: { id: userId } as never,
    response: null as never,
  });
};

const mockUnauthenticated = () => {
  vi.mocked(requireAuthenticatedUser).mockResolvedValue({
    currentUser: null as never,
    response: UNAUTHORIZED_RESPONSE() as never,
  });
};

describe("api/v1/card-decks/[deckId] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET 비인증 사용자는 401 + 한국어 에러 메시지를 반환한다", async () => {
    mockUnauthenticated();

    const response = await GET(
      new NextRequest("http://localhost/api/v1/card-decks/deck-1"),
      { params: Promise.resolve({ deckId: "deck-1" }) }
    );

    expect(response.status).toBe(401);
    const body = (await response.json()) as { message: string };
    expect(body.message).toBe("로그인이 필요합니다.");
    expect(getCardDeckDetail).not.toHaveBeenCalled();
  });

  it("GET 비소유자는 service ServiceError(404) 를 그대로 404 로 응답한다", async () => {
    mockAuthenticated();
    vi.mocked(getCardDeckDetail).mockRejectedValueOnce(
      new ServiceError(404, "덱을 찾지 못했습니다.")
    );

    const response = await GET(
      new NextRequest("http://localhost/api/v1/card-decks/deck-not-mine"),
      { params: Promise.resolve({ deckId: "deck-not-mine" }) }
    );

    expect(response.status).toBe(404);
    const body = (await response.json()) as { message: string };
    expect(body.message).toBe("덱을 찾지 못했습니다.");
    expect(getCardDeckDetail).toHaveBeenCalledWith("user-1", "deck-not-mine");
  });

  it("PATCH Zod 스키마 위반(title 빈 문자열) 은 400 을 반환한다", async () => {
    mockAuthenticated();

    const response = await PATCH(
      new NextRequest("http://localhost/api/v1/card-decks/deck-1", {
        method: "PATCH",
        body: JSON.stringify({ title: "" }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ deckId: "deck-1" }) }
    );

    expect(response.status).toBe(400);
    const body = (await response.json()) as { message: string };
    expect(body.message).toBe("수정 요청 형식이 올바르지 않습니다.");
    expect(updateCardDeck).not.toHaveBeenCalled();
  });

  it("GET 정상 요청은 200 + cardDeckDetailResponseSchema 와 일치하는 본문을 반환한다", async () => {
    mockAuthenticated();
    const detail: CardDeckDetailResponse = {
      deck: {
        id: "deck-1",
        title: "샘플 덱",
        description: null,
        itemCount: 2,
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z",
      },
      items: [
        {
          id: "item-1",
          frontText: "앞면 1",
          backText: "뒷면 1",
          imageStorageKey: null,
          imageUrl: null,
          reviewDifficulty: null,
          lastReviewedAt: null,
          nextReviewAt: null,
          createdAt: "2026-05-01T00:00:00.000Z",
          updatedAt: "2026-05-01T00:00:00.000Z",
        },
        {
          id: "item-2",
          frontText: "앞면 2",
          backText: "뒷면 2",
          imageStorageKey: null,
          imageUrl: null,
          reviewDifficulty: "good",
          lastReviewedAt: "2026-05-01T00:00:00.000Z",
          nextReviewAt: "2026-05-02T00:00:00.000Z",
          createdAt: "2026-05-01T00:00:00.000Z",
          updatedAt: "2026-05-01T00:00:00.000Z",
        },
      ],
      studyMode: "flashcard",
    };
    vi.mocked(getCardDeckDetail).mockResolvedValueOnce(detail);

    const response = await GET(
      new NextRequest("http://localhost/api/v1/card-decks/deck-1"),
      { params: Promise.resolve({ deckId: "deck-1" }) }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    const parsed = cardDeckDetailResponseSchema.safeParse(body);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.deck.id).toBe("deck-1");
      expect(parsed.data.items).toHaveLength(2);
      expect(parsed.data.studyMode).toBe("flashcard");
    }
    expect(getCardDeckDetail).toHaveBeenCalledWith("user-1", "deck-1");
  });

  describe("DELETE", () => {
    it("비인증 사용자는 401 + 한국어 에러 메시지를 반환한다", async () => {
      mockUnauthenticated();

      const response = await DELETE(
        new NextRequest("http://localhost/api/v1/card-decks/deck-1", {
          method: "DELETE",
        }),
        { params: Promise.resolve({ deckId: "deck-1" }) }
      );

      expect(response.status).toBe(401);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("로그인이 필요합니다.");
      expect(deleteCardDeck).not.toHaveBeenCalled();
    });

    it("비소유자는 service ServiceError(404) 를 그대로 404 로 응답한다", async () => {
      mockAuthenticated();
      vi.mocked(deleteCardDeck).mockRejectedValueOnce(
        new ServiceError(404, "덱을 찾지 못했습니다.")
      );

      const response = await DELETE(
        new NextRequest("http://localhost/api/v1/card-decks/deck-not-mine", {
          method: "DELETE",
        }),
        { params: Promise.resolve({ deckId: "deck-not-mine" }) }
      );

      expect(response.status).toBe(404);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("덱을 찾지 못했습니다.");
      expect(deleteCardDeck).toHaveBeenCalledWith("user-1", "deck-not-mine");
    });

    it("정상 요청은 204 + 빈 본문을 반환하고 deleteCardDeck 을 호출한다", async () => {
      mockAuthenticated();
      vi.mocked(deleteCardDeck).mockResolvedValueOnce(undefined);

      const response = await DELETE(
        new NextRequest("http://localhost/api/v1/card-decks/deck-1", {
          method: "DELETE",
        }),
        { params: Promise.resolve({ deckId: "deck-1" }) }
      );

      expect(response.status).toBe(204);
      expect(await response.text()).toBe("");
      expect(deleteCardDeck).toHaveBeenCalledTimes(1);
      expect(deleteCardDeck).toHaveBeenCalledWith("user-1", "deck-1");
    });
  });
});
