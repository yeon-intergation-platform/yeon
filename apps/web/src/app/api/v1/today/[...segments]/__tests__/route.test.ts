import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TodaySpringBackendHttpError } from "@/server/today-spring-client";

const mockRequireAuthenticatedUser = vi.fn();
const mockRequestTodaySpring = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", async () => {
  const actual = await vi.importActual<
    typeof import("@/app/api/v1/counseling-records/_shared")
  >("@/app/api/v1/counseling-records/_shared");
  return {
    ...actual,
    requireAuthenticatedUser: (...args: unknown[]) =>
      mockRequireAuthenticatedUser(...args),
  };
});

vi.mock("@/server/today-spring-client", async () => {
  const actual = await vi.importActual<
    typeof import("@/server/today-spring-client")
  >("@/server/today-spring-client");
  return {
    ...actual,
    requestTodaySpring: (...args: unknown[]) => mockRequestTodaySpring(...args),
  };
});

import { DELETE, GET, POST } from "../route";

const context = (segments: string[]) => ({
  params: Promise.resolve({ segments }),
});

describe("api/v1/today catch-all route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: new Response(null, { status: 401 }),
    });
  });

  it("board 조회는 검증된 날짜만 Spring으로 전달한다", async () => {
    mockRequestTodaySpring.mockResolvedValue({
      status: 200,
      payload: {
        date: "2026-07-22",
        tasks: [],
        inboxCount: 0,
        summary: {
          totalCount: 0,
          completedCount: 0,
          completionRate: 0,
          estimatedMinutes: 0,
        },
        recommendation: null,
        serverTime: "2026-07-22T00:00:00Z",
      },
    });

    const response = await GET(
      new NextRequest("http://localhost/api/v1/today/board?date=2026-07-22"),
      context(["board"])
    );

    expect(response.status).toBe(200);
    expect(mockRequestTodaySpring).toHaveBeenCalledWith(
      "user-1",
      "/today/board?date=2026-07-22",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("잘못된 날짜는 Spring 호출 전 400으로 거절한다", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/v1/today/board?date=2026-02-30"),
      context(["board"])
    );

    expect(response.status).toBe(400);
    expect(mockRequestTodaySpring).not.toHaveBeenCalled();
  });

  it("할 일 생성 본문은 공유 계약으로 검증한다", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/v1/today/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "   ", plannedDate: "2026-07-22" }),
      }),
      context(["tasks"])
    );

    expect(response.status).toBe(400);
    expect(mockRequestTodaySpring).not.toHaveBeenCalled();
  });

  it("삭제 요청에 version이 없으면 Spring 호출 전 400으로 거절한다", async () => {
    const response = await DELETE(
      new NextRequest(
        "http://localhost/api/v1/today/tasks/550e8400-e29b-41d4-a716-446655440000",
        { method: "DELETE" }
      ),
      context(["tasks", "550e8400-e29b-41d4-a716-446655440000"])
    );

    expect(response.status).toBe(400);
    expect(mockRequestTodaySpring).not.toHaveBeenCalled();
  });

  it("Spring 충돌 오류의 코드와 메시지를 보존한다", async () => {
    mockRequestTodaySpring.mockRejectedValue(
      new TodaySpringBackendHttpError(
        409,
        "새로고침 후 다시 시도해주세요.",
        "TODAY_VERSION_CONFLICT"
      )
    );

    const response = await POST(
      new NextRequest(
        "http://localhost/api/v1/today/tasks/550e8400-e29b-41d4-a716-446655440000/complete",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ version: 1 }),
        }
      ),
      context(["tasks", "550e8400-e29b-41d4-a716-446655440000", "complete"])
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      code: "TODAY_VERSION_CONFLICT",
      message: "새로고침 후 다시 시도해주세요.",
    });
  });
});
