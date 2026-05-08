import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetTypingDeckRequestContext = vi.fn();
const mockFetchTypingDecksFromSpring = vi.fn();
const mockCreateTypingDeckInSpring = vi.fn();

vi.mock("../_shared", () => ({
  getTypingDeckRequestContext: (...args: unknown[]) =>
    mockGetTypingDeckRequestContext(...args),
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  readJsonBody: async (request: Request) => request.json(),
}));

vi.mock("@/server/typing-decks-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/typing-decks-spring-client")>(
    "@/server/typing-decks-spring-client",
  );
  return {
    ...actual,
    fetchTypingDecksFromSpring: (...args: unknown[]) =>
      mockFetchTypingDecksFromSpring(...args),
    createTypingDeckInSpring: (...args: unknown[]) =>
      mockCreateTypingDeckInSpring(...args),
  };
});

import { GET, POST } from "../route";

describe("api/v1/typing-decks route spring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET all은 default deck과 spring deck을 함께 반환한다", async () => {
    mockGetTypingDeckRequestContext.mockResolvedValue({
      currentUser: { id: "user-1" },
      isAdmin: false,
    });
    mockFetchTypingDecksFromSpring.mockResolvedValue({
      decks: [
        {
          id: "tdk_user_1",
          title: "사용자 덱",
          description: null,
          languageTag: "ko",
          visibility: "public",
          source: "user",
          passageCount: 1,
          isOwner: true,
          canEdit: true,
          createdAt: "2026-05-08T00:00:00.000Z",
          updatedAt: "2026-05-08T00:00:00.000Z",
        },
      ],
    });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/v1/typing-decks?scope=all&languageTag=ko",
      ),
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { decks: Array<{ id: string }> };
    expect(body.decks[0]?.id).toBe("default-ko-azaleas");
    expect(body.decks.at(-1)?.id).toBe("tdk_user_1");
  });

  it("POST는 spring 생성 결과를 201로 반환한다", async () => {
    mockGetTypingDeckRequestContext.mockResolvedValue({
      currentUser: { id: "user-1" },
      isAdmin: false,
    });
    mockCreateTypingDeckInSpring.mockResolvedValue({
      deck: {
        id: "tdk_user_1",
        title: "새 덱",
        description: null,
        languageTag: "ko",
        visibility: "private",
        source: "user",
        passageCount: 0,
        isOwner: true,
        canEdit: true,
        createdAt: "2026-05-08T00:00:00.000Z",
        updatedAt: "2026-05-08T00:00:00.000Z",
      },
    });

    const response = await POST(
      new NextRequest("http://localhost/api/v1/typing-decks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "새 덱",
          description: null,
          languageTag: "ko",
          visibility: "private",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(mockCreateTypingDeckInSpring).toHaveBeenCalledWith(
      "user-1",
      {
        title: "새 덱",
        description: null,
        languageTag: "ko",
        visibility: "private",
      },
      false,
    );
  });
});
