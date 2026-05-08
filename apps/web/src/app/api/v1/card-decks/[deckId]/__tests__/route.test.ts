import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchCardDeckDetailFromSpring = vi.fn();
const mockUpdateCardDeckInSpring = vi.fn();
const mockDeleteCardDeckInSpring = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) => Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) => mockRequireAuthenticatedUser(...args),
}));

vi.mock("@/server/card-decks-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/card-decks-spring-client")>("@/server/card-decks-spring-client");
  return {
    ...actual,
    fetchCardDeckDetailFromSpring: (...args: unknown[]) => mockFetchCardDeckDetailFromSpring(...args),
    updateCardDeckInSpring: (...args: unknown[]) => mockUpdateCardDeckInSpring(...args),
    deleteCardDeckInSpring: (...args: unknown[]) => mockDeleteCardDeckInSpring(...args),
  };
});

import { DELETE, GET, PATCH } from "../route";

describe("api/v1/card-decks/[deckId] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
  });

  it("GET은 spring detail을 반환한다", async () => {
    mockFetchCardDeckDetailFromSpring.mockResolvedValue({ deck: { id: "dck_1" }, items: [], studyMode: "flashcard" });
    const response = await GET(new NextRequest("http://localhost/api/v1/card-decks/dck_1"), { params: Promise.resolve({ deckId: "dck_1" }) });
    expect(response.status).toBe(200);
    expect(mockFetchCardDeckDetailFromSpring).toHaveBeenCalledWith("user-1", "dck_1");
  });

  it("PATCH는 spring 수정 결과를 반환한다", async () => {
    mockUpdateCardDeckInSpring.mockResolvedValue({ deck: { id: "dck_1", title: "수정" } });
    const response = await PATCH(new NextRequest("http://localhost/api/v1/card-decks/dck_1", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "수정" }) }), { params: Promise.resolve({ deckId: "dck_1" }) });
    expect(response.status).toBe(200);
    expect(mockUpdateCardDeckInSpring).toHaveBeenCalledWith("user-1", "dck_1", { title: "수정" });
  });

  it("DELETE는 spring 삭제 후 204를 반환한다", async () => {
    mockDeleteCardDeckInSpring.mockResolvedValue({ ok: true });
    const response = await DELETE(new NextRequest("http://localhost/api/v1/card-decks/dck_1", { method: "DELETE" }), { params: Promise.resolve({ deckId: "dck_1" }) });
    expect(response.status).toBe(204);
  });
});
