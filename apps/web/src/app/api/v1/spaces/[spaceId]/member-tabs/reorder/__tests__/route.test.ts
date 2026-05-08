import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("/api/v1/spaces/[spaceId]/member-tabs/reorder", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("PATCH: reorder 요청을 Spring으로 전달하고 ok 응답을 유지한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const { PATCH } = await import("../route");
    const response = await PATCH(
      new Request("http://localhost/api/v1/spaces/space_alpha/member-tabs/reorder", {
        method: "PATCH",
        body: JSON.stringify({ order: ["mtb_hidden", "mtb_overview"] }),
        headers: { "content-type": "application/json" },
      }) as never,
      { params: Promise.resolve({ spaceId: "space_alpha" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/member-tabs/reorder",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ order: ["mtb_hidden", "mtb_overview"] }),
        headers: expect.objectContaining({
          "X-Yeon-User-Id": "user-1",
          "X-Yeon-Internal-Token": "internal-token",
        }),
      }),
    );
  });

  test("PATCH: Spring 404는 jsonError로 번역한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ code: "SPACE_NOT_FOUND", message: "스페이스를 찾지 못했습니다." }),
          {
            status: 404,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    const { PATCH } = await import("../route");
    const response = await PATCH(
      new Request("http://localhost/api/v1/spaces/missing/member-tabs/reorder", {
        method: "PATCH",
        body: JSON.stringify({ order: ["mtb_a"] }),
        headers: { "content-type": "application/json" },
      }) as never,
      { params: Promise.resolve({ spaceId: "missing" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "스페이스를 찾지 못했습니다." });
  });
});
