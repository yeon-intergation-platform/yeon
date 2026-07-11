import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireAuthenticatedUser = vi.fn();
const mockCreateAttempt = vi.fn();
const mockFetchAttempts = vi.fn();
const mockCreatePreview = vi.fn();
const mockCreateBulk = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number, detail?: { code?: string }) =>
    Response.json({ message, ...detail }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) =>
    mockRequireAuthenticatedUser(...args),
}));

vi.mock("@/server/card-recall-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/card-recall-spring-client")
  >("@/server/card-recall-spring-client");
  return {
    ...actual,
    createRecallAttemptInSpring: (...args: unknown[]) =>
      mockCreateAttempt(...args),
    fetchRecallAttemptsFromSpring: (...args: unknown[]) =>
      mockFetchAttempts(...args),
    createCardDeckAiPreviewInSpring: (...args: unknown[]) =>
      mockCreatePreview(...args),
    createCardDeckWithItemsInSpring: (...args: unknown[]) =>
      mockCreateBulk(...args),
  };
});

import { CardRecallSpringBackendHttpError } from "@/server/card-recall-spring-client";
import { POST as createAttempt } from "../[deckId]/items/[itemId]/recall-attempts/route";
import { GET as listAttempts } from "../[deckId]/recall-attempts/route";
import { POST as createPreview } from "../ai-previews/route";
import { POST as createBulk } from "../bulk/route";

const IDEMPOTENCY_KEY = "123e4567-e89b-42d3-a456-426614174000";
const CREATED_AT = "2026-07-11T01:00:00.000Z";
const INVALID_UPSTREAM_RESPONSE = {
  code: "CARD_RECALL_UPSTREAM_INVALID_RESPONSE",
  message: "백지 학습 서버 응답 형식이 올바르지 않습니다.",
} as const;

function gradeResponse() {
  return {
    attemptId: "rca_1",
    score: 82,
    verdict: "pass",
    missedPoints: ["예외 처리"],
    feedback: "핵심을 기억했습니다.",
    reviewDifficulty: "good",
    lastReviewedAt: CREATED_AT,
    nextReviewAt: "2026-07-14T01:00:00.000Z",
    createdAt: CREATED_AT,
  };
}

function createAttemptRequest() {
  return new NextRequest(
    "http://localhost/api/v1/card-decks/dck_1/items/dki_1/recall-attempts",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userAnswer: "기억한 답",
        idempotencyKey: IDEMPOTENCY_KEY,
      }),
    }
  );
}

function createPreviewRequest() {
  return new NextRequest("http://localhost/api/v1/card-decks/ai-previews", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      idempotencyKey: IDEMPOTENCY_KEY,
      sourceText: "원문",
      itemCount: 5,
    }),
  });
}

function createBulkRequest() {
  return new NextRequest("http://localhost/api/v1/card-decks/bulk", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      idempotencyKey: IDEMPOTENCY_KEY,
      title: "운영체제",
      items: [{ frontText: "프로세스란?", backText: "실행 중인 프로그램" }],
    }),
  });
}

async function expectInvalidUpstreamResponse(response: Response) {
  expect(response.status).toBe(502);
  await expect(response.json()).resolves.toEqual(INVALID_UPSTREAM_RESPONSE);
}

describe("card recall BFF routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("답안 채점은 인증 사용자와 idempotency key를 Spring에 전달한다", async () => {
    mockCreateAttempt.mockResolvedValue(gradeResponse());
    const response = await createAttempt(createAttemptRequest(), {
      params: Promise.resolve({ deckId: "dck_1", itemId: "dki_1" }),
    });

    expect(response.status).toBe(201);
    expect(mockCreateAttempt).toHaveBeenCalledWith("user-1", "dck_1", "dki_1", {
      userAnswer: "기억한 답",
      idempotencyKey: IDEMPOTENCY_KEY,
    });
  });

  it("비인증 AI preview 요청은 401이며 Spring을 호출하지 않는다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: null,
      response: Response.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      ),
    });
    const response = await createPreview(
      new NextRequest("http://localhost/api/v1/card-decks/ai-previews", {
        method: "POST",
        body: JSON.stringify({
          idempotencyKey: IDEMPOTENCY_KEY,
          sourceText: "원문",
          itemCount: 5,
        }),
      })
    );

    expect(response.status).toBe(401);
    expect(mockCreatePreview).not.toHaveBeenCalled();
  });

  it("Spring 429와 사용량 제한 코드를 그대로 전달한다", async () => {
    mockCreatePreview.mockRejectedValue(
      new CardRecallSpringBackendHttpError(
        429,
        "AI 사용량 한도를 초과했습니다.",
        "AI_USAGE_LIMIT_EXCEEDED"
      )
    );
    const response = await createPreview(createPreviewRequest());

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      message: "AI 사용량 한도를 초과했습니다.",
      code: "AI_USAGE_LIMIT_EXCEEDED",
    });
  });

  it("답안 채점의 잘못된 Spring 성공 응답은 안정적인 502로 변환한다", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockCreateAttempt.mockResolvedValue({ score: "잘못된 값" });

    const response = await createAttempt(createAttemptRequest(), {
      params: Promise.resolve({ deckId: "dck_1", itemId: "dki_1" }),
    });

    await expectInvalidUpstreamResponse(response);
    expect(consoleError).toHaveBeenCalledOnce();
  });

  it("기록 조회의 잘못된 Spring 성공 응답은 안정적인 502로 변환한다", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockFetchAttempts.mockResolvedValue({
      attempts: [{ internal: "노출 금지" }],
    });

    const response = await listAttempts(
      new NextRequest(
        "http://localhost/api/v1/card-decks/dck_1/recall-attempts?limit=7"
      ),
      { params: Promise.resolve({ deckId: "dck_1" }) }
    );

    await expectInvalidUpstreamResponse(response);
    expect(consoleError).toHaveBeenCalledOnce();
  });

  it("AI 초안의 잘못된 Spring 성공 응답은 안정적인 502로 변환한다", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockCreatePreview.mockResolvedValue({ title: "제목", items: [] });

    const response = await createPreview(createPreviewRequest());

    await expectInvalidUpstreamResponse(response);
    expect(consoleError).toHaveBeenCalledOnce();
  });

  it("덱 일괄 생성의 잘못된 Spring 성공 응답은 안정적인 502로 변환한다", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockCreateBulk.mockResolvedValue({ deck: { id: "dck_1" }, items: [] });

    const response = await createBulk(createBulkRequest());

    await expectInvalidUpstreamResponse(response);
    expect(consoleError).toHaveBeenCalledOnce();
  });

  it("bulk 요청의 잘못된 JSON은 400이며 Spring을 호출하지 않는다", async () => {
    const response = await createBulk(
      new NextRequest("http://localhost/api/v1/card-decks/bulk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      })
    );

    expect(response.status).toBe(400);
    expect(mockCreateBulk).not.toHaveBeenCalled();
  });

  it("history limit을 검증해 Spring에 전달한다", async () => {
    mockFetchAttempts.mockResolvedValue({ attempts: [] });
    const response = await listAttempts(
      new NextRequest(
        "http://localhost/api/v1/card-decks/dck_1/recall-attempts?limit=7"
      ),
      { params: Promise.resolve({ deckId: "dck_1" }) }
    );

    expect(response.status).toBe(200);
    expect(mockFetchAttempts).toHaveBeenCalledWith("user-1", "dck_1", 7);
  });
});
