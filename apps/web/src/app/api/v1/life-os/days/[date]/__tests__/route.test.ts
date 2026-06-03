import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAuthenticatedUser,
  mockFetchLifeOsDayFromSpring,
  mockUpdateLifeOsDayInSpring,
} = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  mockFetchLifeOsDayFromSpring: vi.fn(),
  mockUpdateLifeOsDayInSpring: vi.fn(),
}));

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

vi.mock("@/server/life-os-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/life-os-spring-client")
  >("@/server/life-os-spring-client");
  return {
    ...actual,
    fetchLifeOsDayFromSpring: (...args: unknown[]) =>
      mockFetchLifeOsDayFromSpring(...args),
    updateLifeOsDayInSpring: (...args: unknown[]) =>
      mockUpdateLifeOsDayInSpring(...args),
  };
});
import { GET, PUT } from "../route";

describe("api/v1/life-os/days/[date] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET은 invalid date면 400이다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    const response = await GET(
      new NextRequest("http://localhost/api/v1/life-os/days/bad"),
      { params: Promise.resolve({ date: "bad" }) }
    );
    expect(response.status).toBe(400);
  });

  it("GET은 Spring day 응답을 유지한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockFetchLifeOsDayFromSpring.mockResolvedValue({
      day: {
        localDate: "2026-05-08",
        timezone: "Asia/Seoul",
        mindset: "",
        backlogText: "",
        entries: [],
        id: "lod_1",
        createdAt: "2026-05-08T07:00:00.000Z",
        updatedAt: "2026-05-08T07:00:00.000Z",
      },
    });
    const response = await GET(
      new NextRequest("http://localhost/api/v1/life-os/days/2026-05-08"),
      { params: Promise.resolve({ date: "2026-05-08" }) }
    );
    expect(response.status).toBe(200);
  });

  it("PUT은 path date를 유지해 Spring update를 호출한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    mockUpdateLifeOsDayInSpring.mockResolvedValue({
      day: {
        localDate: "2026-05-08",
        timezone: "Asia/Seoul",
        mindset: "",
        backlogText: "",
        entries: [],
        id: "lod_1",
        createdAt: "2026-05-08T07:00:00.000Z",
        updatedAt: "2026-05-08T07:00:00.000Z",
      },
    });
    const response = await PUT(
      new NextRequest("http://localhost/api/v1/life-os/days/2026-05-08", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          localDate: "2026-05-07",
          timezone: "Asia/Seoul",
          mindset: "",
          backlogText: "",
          entries: [],
        }),
      }),
      { params: Promise.resolve({ date: "2026-05-08" }) }
    );
    expect(response.status).toBe(200);
    expect(mockUpdateLifeOsDayInSpring).toHaveBeenCalledWith(
      "user-1",
      "2026-05-08",
      expect.objectContaining({ localDate: "2026-05-08" })
    );
  });
});
