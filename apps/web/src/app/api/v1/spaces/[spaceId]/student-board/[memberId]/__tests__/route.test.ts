import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("/api/v1/spaces/[spaceId]/student-board/[memberId]", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("PATCH: Spring update를 호출하고 board 응답을 유지한다", async () => {
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
                lastPublicCheckAt: null,
                isSelfCheckReady: true,
                dailyCells: [],
              },
            ],
            sessions: [],
            historyPeriod: "7d",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const { PATCH } = await import("../route");
    const response = await PATCH(
      new Request("http://localhost/api/v1/spaces/space_alpha/student-board/mem_1", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          attendanceStatus: "present",
          assignmentStatus: "done",
          assignmentLink: null,
        }),
      }) as never,
      { params: Promise.resolve({ spaceId: "space_alpha", memberId: "mem_1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.rows[0].memberId).toBe("mem_1");
    expect(body.historyPeriod).toBe("7d");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/student-board/mem_1",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          "X-Yeon-User-Id": "user-1",
          "X-Yeon-Internal-Token": "internal-token",
        }),
        body: JSON.stringify({
          attendanceStatus: "present",
          assignmentStatus: "done",
          assignmentLink: null,
        }),
      }),
    );
  });
});
