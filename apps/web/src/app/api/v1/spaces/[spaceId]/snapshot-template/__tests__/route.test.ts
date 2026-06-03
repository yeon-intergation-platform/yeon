import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("POST /api/v1/spaces/[spaceId]/snapshot-template", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("Spring backend snapshot 결과를 그대로 반환한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ template: { id: "tpl_snapshot", name: "스냅샷" } }),
          {
            status: 201,
            headers: { "content-type": "application/json" },
          }
        )
      )
    );

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost/api/v1/spaces/spc_1/snapshot-template", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "스냅샷", description: "설명" }),
      }) as never,
      { params: Promise.resolve({ spaceId: "spc_1" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ template: { id: "tpl_snapshot", name: "스냅샷" } });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/spc_1/snapshot-template",
      expect.objectContaining({
        method: "POST",
        headers: expect.any(Headers),
      })
    );
    const requestHeaders = (fetch as unknown as Mock).mock.calls[0][1]
      .headers as Headers;
    expect(requestHeaders.get("X-Yeon-User-Id")).toBe("user-1");
    expect(requestHeaders.get("X-Yeon-Internal-Token")).toBe("internal-token");
    expect(requestHeaders.get("content-type")).toBe("application/json");
  });

  test("Spring 404는 jsonError로 번역한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "SPACE_NOT_FOUND",
            message: "스페이스를 찾지 못했습니다.",
          }),
          {
            status: 404,
            headers: { "content-type": "application/json" },
          }
        )
      )
    );

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost/api/v1/spaces/missing/snapshot-template", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "스냅샷" }),
      }) as never,
      { params: Promise.resolve({ spaceId: "missing" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "스페이스를 찾지 못했습니다." });
  });
});
