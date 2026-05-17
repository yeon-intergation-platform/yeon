import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchCardDecksFromSpring = vi.fn();
const mockCreateCardDeckInSpring = vi.fn();

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
    fetchCardDecksFromSpring: (...args: unknown[]) =>
      mockFetchCardDecksFromSpring(...args),
    createCardDeckInSpring: (...args: unknown[]) =>
      mockCreateCardDeckInSpring(...args),
  };
});

import { GET, POST } from "../route";
import { CardDecksSpringBackendHttpError } from "@/server/card-decks-spring-client";

describe("api/v1/card-decks route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
  });

  it("GET은 Spring decks 결과를 반환한다", async () => {
    mockFetchCardDecksFromSpring.mockResolvedValue({
      decks: [{ id: "dck_1" }],
    });
    const response = await GET(
      new NextRequest("http://localhost/api/v1/card-decks")
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      decks: [{ id: "dck_1" }],
    });
    expect(mockFetchCardDecksFromSpring).toHaveBeenCalledWith("user-1");
  });

  it("GET은 Spring 실패를 Next DB fallback 없이 그대로 반환한다", async () => {
    mockFetchCardDecksFromSpring.mockRejectedValue(
      new CardDecksSpringBackendHttpError(
        503,
        "카드 서비스 요청에 실패했습니다."
      )
    );

    const response = await GET(
      new NextRequest("http://localhost/api/v1/card-decks")
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      message: "카드 서비스 요청에 실패했습니다.",
    });
    expect(mockFetchCardDecksFromSpring).toHaveBeenCalledWith("user-1");
  });

  it("POST는 Spring create 결과를 201로 반환한다", async () => {
    mockCreateCardDeckInSpring.mockResolvedValue({ deck: { id: "dck_1" } });
    const response = await POST(
      new NextRequest("http://localhost/api/v1/card-decks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "덱" }),
      })
    );
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ deck: { id: "dck_1" } });
    expect(mockCreateCardDeckInSpring).toHaveBeenCalledWith("user-1", {
      title: "덱",
    });
  });
});
