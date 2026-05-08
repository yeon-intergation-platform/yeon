import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchCardStudyPreferenceFromSpring = vi.fn();
const mockUpdateCardStudyPreferenceInSpring = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) => Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) => mockRequireAuthenticatedUser(...args),
}));

vi.mock("@/server/card-decks-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/card-decks-spring-client")>("@/server/card-decks-spring-client");
  return {
    ...actual,
    fetchCardStudyPreferenceFromSpring: (...args: unknown[]) => mockFetchCardStudyPreferenceFromSpring(...args),
    updateCardStudyPreferenceInSpring: (...args: unknown[]) => mockUpdateCardStudyPreferenceInSpring(...args),
  };
});

import { GET, PATCH } from "../route";

describe("card study preference route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
  });

  it("GET은 spring studyMode를 반환한다", async () => {
    mockFetchCardStudyPreferenceFromSpring.mockResolvedValue({ studyMode: "flashcard" });
    const response = await GET(new NextRequest("http://localhost/api/v1/card-decks/study-preference"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ studyMode: "flashcard" });
  });

  it("PATCH는 spring 저장 결과를 반환한다", async () => {
    mockUpdateCardStudyPreferenceInSpring.mockResolvedValue({ studyMode: "review" });
    const response = await PATCH(new NextRequest("http://localhost/api/v1/card-decks/study-preference", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ studyMode: "review" }) }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ studyMode: "review" });
    expect(mockUpdateCardStudyPreferenceInSpring).toHaveBeenCalledWith("user-1", { studyMode: "review" });
  });
});
