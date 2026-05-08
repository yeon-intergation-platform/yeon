import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("/api/v1/spaces/[spaceId]/members/[memberId]/activity-logs", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("GET: query를 Spring으로 전달하고 logs 응답을 유지한다", async () => {
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
            logs: [
              {
                id: "alg_1",
                memberId: "mem_1",
                spaceId: "space_alpha",
                type: "coaching-note",
                status: null,
                recordedAt: "2026-05-08T00:00:00.000Z",
                source: "manual",
                metadata: { noteText: "메모", authorLabel: "멘토" },
                createdAt: "2026-05-08T00:00:00.000Z",
              },
            ],
            totalCount: 1,
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const { GET } = await import("../route");
    const request = new Request(
      "http://localhost/api/v1/spaces/space_alpha/members/mem_1/activity-logs?type=coaching-note&limit=100",
      { method: "GET" },
    ) as Request & { nextUrl?: URL };
    request.nextUrl = new URL(request.url);

    const response = await GET(request as never, {
      params: Promise.resolve({ spaceId: "space_alpha", memberId: "mem_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totalCount).toBe(1);
    expect(body.logs[0].id).toBe("alg_1");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/members/mem_1/activity-logs?type=coaching-note&limit=100",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "X-Yeon-User-Id": "user-1",
          "X-Yeon-Internal-Token": "internal-token",
        }),
      }),
    );
  });

  test("POST: 생성 요청을 Spring으로 전달하고 log 응답을 유지한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1", displayName: "멘토" },
      response: null,
    });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            log: {
              id: "alg_1",
              memberId: "mem_1",
              spaceId: "space_alpha",
              type: "coaching-note",
              status: null,
              recordedAt: "2026-05-08T00:00:00.000Z",
              source: "manual",
              metadata: { noteText: "메모", authorLabel: "멘토" },
              createdAt: "2026-05-08T00:00:00.000Z",
            },
          }),
          { status: 201, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost/api/v1/spaces/space_alpha/members/mem_1/activity-logs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "메모" }),
      }) as never,
      { params: Promise.resolve({ spaceId: "space_alpha", memberId: "mem_1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.log.id).toBe("alg_1");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/members/mem_1/activity-logs",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ text: "메모", authorLabel: "멘토" }),
      }),
    );
  });
});
