import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAuthenticatedUser, mockFetchLifeOsDaysFromSpring, mockCreateLifeOsDayInSpring } = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  mockFetchLifeOsDaysFromSpring: vi.fn(),
  mockCreateLifeOsDayInSpring: vi.fn(),
}));

import { LifeOsSpringBackendHttpError } from "@/server/life-os-spring-client";


vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

vi.mock("@/server/life-os-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/life-os-spring-client")>(
    "@/server/life-os-spring-client",
  );
  return {
    ...actual,
    fetchLifeOsDaysFromSpring: (...args: unknown[]) => mockFetchLifeOsDaysFromSpring(...args),
    createLifeOsDayInSpring: (...args: unknown[]) => mockCreateLifeOsDayInSpring(...args),
  };
});

import { GET, POST } from "../route";

describe("api/v1/life-os/days route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET은 Spring 목록 응답을 유지한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockFetchLifeOsDaysFromSpring.mockResolvedValue({ days: [] });

    const response = await GET(new NextRequest("http://localhost/api/v1/life-os/days"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ days: [] });
  });

  it("POST는 invalid body면 400이다", async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });

    const response = await POST(new NextRequest("http://localhost/api/v1/life-os/days", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ localDate: "bad-date" }),
    }));

    expect(response.status).toBe(400);
  });

  it("POST는 Spring status를 그대로 노출한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockCreateLifeOsDayInSpring.mockRejectedValue(new LifeOsSpringBackendHttpError(409, "중복"));

    const response = await POST(new NextRequest("http://localhost/api/v1/life-os/days", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ localDate: "2026-05-08", timezone: "Asia/Seoul", mindset: "", backlogText: "", entries: [] }),
    }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ message: "중복" });
  });
});
