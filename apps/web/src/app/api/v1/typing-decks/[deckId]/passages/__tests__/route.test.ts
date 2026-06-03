import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetTypingDeckRequestContext = vi.fn();
const mockCreateTypingDeckPassageInSpring = vi.fn();

vi.mock("../../_shared", () => ({
  getTypingDeckRequestContext: (...args: unknown[]) =>
    mockGetTypingDeckRequestContext(...args),
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  readJsonBody: async (request: Request) => request.json(),
}));

vi.mock("@/server/typing-decks-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/typing-decks-spring-client")
  >("@/server/typing-decks-spring-client");
  return {
    ...actual,
    createTypingDeckPassageInSpring: (...args: unknown[]) =>
      mockCreateTypingDeckPassageInSpring(...args),
  };
});
import { POST } from "../route";

describe("typing deck passages route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTypingDeckRequestContext.mockResolvedValue({
      currentUser: { id: "user-1" },
      isAdmin: false,
    });
  });

  it("POST는 spring passage create를 호출한다", async () => {
    mockCreateTypingDeckPassageInSpring.mockResolvedValue({
      passage: { id: "tps_1" },
    });

    const response = await POST(
      new NextRequest("http://localhost/api/v1/typing-decks/tdk_1/passages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: "문장" }),
      }),
      { params: Promise.resolve({ deckId: "tdk_1" }) }
    );

    expect(response.status).toBe(201);
    expect(mockCreateTypingDeckPassageInSpring).toHaveBeenCalledWith(
      null,
      "tdk_1",
      { prompt: "문장", textType: "short", difficulty: "normal" },
      false
    );
  });
});
