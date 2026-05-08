import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
  withHandler: (handler: () => Promise<Response>) => handler(),
}));

describe("/api/v1/spaces/[spaceId]/members/[memberId]/board-history", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("GET: period query를 Spring으로 전달하고 response shape를 유지한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            period: "30d",
            dailyCells: [
              {
                date: "2026-05-08",
                attendanceStatus: "present",
                assignmentStatus: "done",
                assignmentLink: null,
                occurredAt: "2026-05-08T01:00:00.000Z",
                source: "manual",
              },
            ],
            history: [
              {
                id: "smbh_1",
                memberId: "mem_1",
                memberName: "홍길동",
                historyDate: "2026-05-08",
                occurredAt: "2026-05-08T01:00:00.000Z",
                attendanceStatus: "present",
                assignmentStatus: "done",
                assignmentLink: null,
                source: "manual",
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const { GET } = await import("../route");
    const request = new Request(
      "http://localhost/api/v1/spaces/space_alpha/members/mem_1/board-history?period=30d",
      { method: "GET" },
    ) as Request & { nextUrl?: URL };
    request.nextUrl = new URL(request.url);

    const response = await GET(request as never, {
      params: Promise.resolve({ spaceId: "space_alpha", memberId: "mem_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.period).toBe("30d");
    expect(body.history[0].id).toBe("smbh_1");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/members/mem_1/board-history?period=30d",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "X-Yeon-User-Id": "user-1",
          "X-Yeon-Internal-Token": "internal-token",
        }),
      }),
    );
  });
});
