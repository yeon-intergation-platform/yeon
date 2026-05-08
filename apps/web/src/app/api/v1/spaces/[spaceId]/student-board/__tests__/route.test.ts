import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
  withHandler: (handler: () => Promise<Response>) => handler(),
}));

describe("/api/v1/spaces/[spaceId]/student-board", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("GET: historyPeriod query를 Spring으로 전달하고 board 응답을 유지한다", async () => {
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
            rows: [
              {
                memberId: "mem_1",
                attendanceStatus: "present",
                attendanceMarkedAt: "2026-05-08T01:00:00.000Z",
                attendanceMarkedSource: "manual",
                assignmentStatus: "done",
                assignmentLink: null,
                assignmentMarkedAt: "2026-05-08T01:00:00.000Z",
                assignmentMarkedSource: "manual",
                lastPublicCheckAt: "2026-05-08T01:00:00.000Z",
                isSelfCheckReady: true,
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
              },
            ],
            sessions: [
              {
                id: "pcs_1",
                title: "체크인",
                status: "active",
                checkMode: "attendance_and_assignment",
                enabledMethods: ["qr"],
                publicPath: "/check/token123",
                opensAt: null,
                closesAt: null,
                locationLabel: null,
                radiusMeters: null,
                createdAt: "2026-05-08T07:00:00.000Z",
              },
            ],
            historyPeriod: "30d",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const { GET } = await import("../route");
    const request = new Request(
      "http://localhost/api/v1/spaces/space_alpha/student-board?historyPeriod=30d",
      { method: "GET" },
    ) as Request & { nextUrl?: URL };
    request.nextUrl = new URL(request.url);

    const response = await GET(request as never, {
      params: Promise.resolve({ spaceId: "space_alpha" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.rows[0].memberId).toBe("mem_1");
    expect(body.sessions[0].id).toBe("pcs_1");
    expect(body.historyPeriod).toBe("30d");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/student-board?historyPeriod=30d",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "X-Yeon-User-Id": "user-1",
          "X-Yeon-Internal-Token": "internal-token",
        }),
      }),
    );
  });

  test("POST: Spring create를 호출하고 session 응답을 유지한다", async () => {
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
            session: {
              id: "pcs_1",
              title: "체크인",
              status: "active",
              checkMode: "attendance_and_assignment",
              enabledMethods: ["qr"],
              publicPath: "/check/token123",
              opensAt: null,
              closesAt: null,
              locationLabel: null,
              radiusMeters: null,
              createdAt: "2026-05-08T07:00:00.000Z",
            },
          }),
          { status: 201, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost/api/v1/spaces/space_alpha/student-board", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "체크인",
          checkMode: "attendance_and_assignment",
          enabledMethods: ["qr"],
          opensAt: null,
          closesAt: null,
          locationLabel: null,
          latitude: null,
          longitude: null,
          radiusMeters: null,
        }),
      }) as never,
      { params: Promise.resolve({ spaceId: "space_alpha" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.session.id).toBe("pcs_1");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/public-check-sessions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Yeon-User-Id": "user-1",
          "X-Yeon-Internal-Token": "internal-token",
        }),
      }),
    );
  });
});
