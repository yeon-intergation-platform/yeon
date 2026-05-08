import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetTypingDeckRequestContext = vi.fn();
const mockFetchTypingDeckDetailFromSpring = vi.fn();
const mockUpdateTypingDeckInSpring = vi.fn();
const mockDeleteTypingDeckInSpring = vi.fn();

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
    fetchTypingDeckDetailFromSpring: (...args: unknown[]) =>
      mockFetchTypingDeckDetailFromSpring(...args),
    updateTypingDeckInSpring: (...args: unknown[]) =>
      mockUpdateTypingDeckInSpring(...args),
    deleteTypingDeckInSpring: (...args: unknown[]) =>
      mockDeleteTypingDeckInSpring(...args),
  };
});

import { DELETE, GET, PATCH } from "../route";

describe("api/v1/typing-decks/[deckId] spring route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTypingDeckRequestContext.mockResolvedValue({
      currentUser: { id: "user-1" },
      isAdmin: false,
    });
  });

  it("GET은 non-default deck detail을 spring에서 읽는다", async () => {
    mockFetchTypingDeckDetailFromSpring.mockResolvedValue({
      deck: { id: "tdk_1", title: "덱", source: "user" },
      passages: [],
    });

    const response = await GET(new NextRequest("http://localhost/api/v1/typing-decks/tdk_1"), {
      params: Promise.resolve({ deckId: "tdk_1" }),
    });

    expect(response.status).toBe(200);
    expect(mockFetchTypingDeckDetailFromSpring).toHaveBeenCalledWith({
      userId: null,
      deckId: "tdk_1",
      adminMode: false,
    });
  });

  it("PATCH는 spring 수정 결과를 반환한다", async () => {
    mockUpdateTypingDeckInSpring.mockResolvedValue({
      deck: { id: "tdk_1", title: "변경 덱" },
    });

    const response = await PATCH(
      new NextRequest("http://localhost/api/v1/typing-decks/tdk_1", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "변경 덱" }),
      }),
      { params: Promise.resolve({ deckId: "tdk_1" }) },
    );

    expect(response.status).toBe(200);
    expect(mockUpdateTypingDeckInSpring).toHaveBeenCalledWith(
      null,
      "tdk_1",
      { title: "변경 덱" },
      false,
    );
  });

  it("DELETE는 spring 삭제 후 204를 반환한다", async () => {
    mockDeleteTypingDeckInSpring.mockResolvedValue({ ok: true });

    const response = await DELETE(
      new NextRequest("http://localhost/api/v1/typing-decks/tdk_1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ deckId: "tdk_1" }) },
    );

    expect(response.status).toBe(204);
  });
});
