import type { CreateCardDeckWithItemsBody } from "@yeon/api-contract/recall";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createGuestDeckWithItems: vi.fn(),
  cardServiceFetchJson: vi.fn(),
}));

vi.mock("@/lib/guest-card-service-store", () => ({
  createGuestDeckWithItems: mocks.createGuestDeckWithItems,
}));

vi.mock("../card-service-fetch", () => ({
  cardServiceFetchJson: mocks.cardServiceFetchJson,
}));

import { createWebCardRecallRepository } from "./create-card-recall-repository";

const body: CreateCardDeckWithItemsBody = {
  idempotencyKey: "123e4567-e89b-42d3-a456-426614174000",
  title: "한국사",
  description: null,
  items: [{ frontText: "훈민정음은 누가 만들었나?", backText: "세종대왕" }],
};

const response = {
  deck: {
    id: "guest-deck",
    title: "한국사",
    description: null,
    itemCount: 1,
    createdAt: "2026-07-11T00:00:00.000Z",
    updatedAt: "2026-07-11T00:00:00.000Z",
  },
  items: [
    {
      id: "guest-item",
      frontText: "훈민정음은 누가 만들었나?",
      backText: "세종대왕",
      imageStorageKey: null,
      imageUrl: null,
      reviewDifficulty: null,
      lastReviewedAt: null,
      nextReviewAt: null,
      createdAt: "2026-07-11T00:00:00.000Z",
      updatedAt: "2026-07-11T00:00:00.000Z",
    },
  ],
};

describe("web card recall repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createGuestDeckWithItems.mockResolvedValue(response);
    mocks.cardServiceFetchJson.mockResolvedValue(response);
  });

  it("게스트 덱은 현재 blurt origin의 로컬 저장소에 만든다", async () => {
    await expect(
      createWebCardRecallRepository(false).createDeckWithItems(body)
    ).resolves.toEqual(response);

    expect(mocks.createGuestDeckWithItems).toHaveBeenCalledWith(body);
    expect(mocks.cardServiceFetchJson).not.toHaveBeenCalled();
  });

  it("로그인 덱은 인증 BFF의 원자적 bulk 경계를 사용한다", async () => {
    await createWebCardRecallRepository(true).createDeckWithItems(body);

    expect(mocks.cardServiceFetchJson).toHaveBeenCalledWith(
      "/api/v1/card-decks/bulk",
      expect.objectContaining({ method: "POST" }),
      "카드 덱을 저장하지 못했습니다.",
      expect.anything()
    );
    expect(mocks.createGuestDeckWithItems).not.toHaveBeenCalled();
  });

  it("게스트의 유료 AI 호출은 repository 경계에서 차단한다", async () => {
    await expect(
      createWebCardRecallRepository(false).createAiPreview({
        idempotencyKey: body.idempotencyKey,
        sourceText: "학습 원문",
        instruction: null,
        itemCount: 5,
      })
    ).rejects.toThrow("로그인 후 사용할 수 있습니다");
    expect(mocks.cardServiceFetchJson).not.toHaveBeenCalled();
  });
});
