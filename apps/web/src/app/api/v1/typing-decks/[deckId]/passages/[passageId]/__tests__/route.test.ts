import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetTypingDeckRequestContext = vi.fn();
const mockUpdateTypingDeckPassageInSpring = vi.fn();
const mockDeleteTypingDeckPassageInSpring = vi.fn();

vi.mock("../../../_shared", () => ({
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
    updateTypingDeckPassageInSpring: (...args: unknown[]) =>
      mockUpdateTypingDeckPassageInSpring(...args),
    deleteTypingDeckPassageInSpring: (...args: unknown[]) =>
      mockDeleteTypingDeckPassageInSpring(...args),
  };
});

import { DELETE, PATCH } from "../route";

describe("typing deck passage item route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTypingDeckRequestContext.mockResolvedValue({
      currentUser: { id: "user-1" },
      isAdmin: false,
    });
  });

  it("PATCH는 spring passage update를 호출한다", async () => {
    mockUpdateTypingDeckPassageInSpring.mockResolvedValue({
      passage: { id: "tps_1" },
    });

    const response = await PATCH(
      new NextRequest("http://localhost/api/v1/typing-decks/tdk_1/passages/tps_1", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: "수정 문장" }),
      }),
      { params: Promise.resolve({ deckId: "tdk_1", passageId: "tps_1" }) },
    );

    expect(response.status).toBe(200);
    expect(mockUpdateTypingDeckPassageInSpring).toHaveBeenCalledWith(
      null,
      "tdk_1",
      "tps_1",
      { prompt: "수정 문장" },
      false,
    );
  });

  it("DELETE는 spring passage delete 후 204를 반환한다", async () => {
    mockDeleteTypingDeckPassageInSpring.mockResolvedValue({ ok: true });

    const response = await DELETE(
      new NextRequest("http://localhost/api/v1/typing-decks/tdk_1/passages/tps_1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ deckId: "tdk_1", passageId: "tps_1" }) },
    );

    expect(response.status).toBe(204);
  });
});
