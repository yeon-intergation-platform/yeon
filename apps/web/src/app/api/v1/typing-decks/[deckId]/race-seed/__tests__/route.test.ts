import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetOptionalAuthenticatedUser = vi.fn();
const mockCreateTypingRaceSeedInSpring = vi.fn();

vi.mock("../../_shared", () => ({
  getOptionalAuthenticatedUser: (...args: unknown[]) =>
    mockGetOptionalAuthenticatedUser(...args),
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
}));

vi.mock("@/server/typing-decks-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/typing-decks-spring-client")>(
    "@/server/typing-decks-spring-client",
  );
  return {
    ...actual,
    createTypingRaceSeedInSpring: (...args: unknown[]) =>
      mockCreateTypingRaceSeedInSpring(...args),
  };
});

import { POST } from "../route";

describe("typing deck race seed route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetOptionalAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
    });
  });

  it("POST는 user deck race seed를 spring에서 생성한다", async () => {
    mockCreateTypingRaceSeedInSpring.mockResolvedValue({
      raceSeed: { seedToken: "v1.token" },
    });

    const response = await POST(
      new NextRequest("http://localhost/api/v1/typing-decks/tdk_1/race-seed", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ passageId: "tps_1" }),
      }),
      { params: Promise.resolve({ deckId: "tdk_1" }) },
    );

    expect(response.status).toBe(200);
    expect(mockCreateTypingRaceSeedInSpring).toHaveBeenCalledWith(null, "tdk_1", {
      passageId: "tps_1",
    });
  });
});
