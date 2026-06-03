import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetTypingDeckRequestContext = vi.fn();
const mockCreateTypingDeckPassagesInSpring = vi.fn();

vi.mock("../../../_shared", () => ({
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
    createTypingDeckPassagesInSpring: (...args: unknown[]) =>
      mockCreateTypingDeckPassagesInSpring(...args),
  };
});
import { POST } from "../route";

describe("typing deck bulk passages route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTypingDeckRequestContext.mockResolvedValue({
      currentUser: { id: "user-1" },
      isAdmin: false,
    });
  });

  it("POST는 spring bulk create를 호출한다", async () => {
    mockCreateTypingDeckPassagesInSpring.mockResolvedValue({
      passages: [{ id: "tps_1" }],
    });

    const response = await POST(
      new NextRequest(
        "http://localhost/api/v1/typing-decks/tdk_1/passages/bulk",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ passages: [{ prompt: "문장" }] }),
        }
      ),
      { params: Promise.resolve({ deckId: "tdk_1" }) }
    );

    expect(response.status).toBe(201);
    expect(mockCreateTypingDeckPassagesInSpring).toHaveBeenCalledWith(
      null,
      "tdk_1",
      {
        passages: [{ prompt: "문장", textType: "short", difficulty: "normal" }],
      },
      false
    );
  });
});
