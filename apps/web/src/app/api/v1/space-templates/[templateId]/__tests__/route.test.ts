import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("GET /api/v1/space-templates/[templateId]", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("상세 응답을 Spring backend에서 받아 그대로 반환한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ template: { id: "tmpl-1", isSystem: true } }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    const { GET } = await import("../route");
    const response = await GET(
      new Request("http://localhost/api/v1/space-templates/tmpl-1") as never,
      { params: Promise.resolve({ templateId: "tmpl-1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ template: { id: "tmpl-1", isSystem: true } });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/space-templates/tmpl-1",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Yeon-User-Id": "user-1",
          "X-Yeon-Internal-Token": "internal-token",
        }),
      }),
    );
  });

  test("Spring 404는 jsonError로 번역한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: "SPACE_TEMPLATE_NOT_FOUND", message: "템플릿을 찾지 못했습니다." }), {
          status: 404,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const { GET } = await import("../route");
    const response = await GET(
      new Request("http://localhost/api/v1/space-templates/missing") as never,
      { params: Promise.resolve({ templateId: "missing" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "템플릿을 찾지 못했습니다." });
  });

  test("PATCH는 Spring backend로 위임하고 요약 응답을 그대로 반환한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ template: { id: "tmpl-1", name: "새 이름" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const { PATCH } = await import("../route");
    const response = await PATCH(
      new Request("http://localhost/api/v1/space-templates/tmpl-1", {
        method: "PATCH",
        body: JSON.stringify({ name: "새 이름", description: "새 설명" }),
        headers: { "content-type": "application/json" },
      }) as never,
      { params: Promise.resolve({ templateId: "tmpl-1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ template: { id: "tmpl-1", name: "새 이름" } });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/space-templates/tmpl-1",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          "X-Yeon-User-Id": "user-1",
          "X-Yeon-Internal-Token": "internal-token",
          "content-type": "application/json",
        }),
        body: JSON.stringify({ name: "새 이름", description: "새 설명" }),
      }),
    );
  });

  test("DELETE는 Spring backend로 위임하고 204를 반환한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );

    const { DELETE } = await import("../route");
    const response = await DELETE(
      new Request("http://localhost/api/v1/space-templates/tmpl-1", {
        method: "DELETE",
      }) as never,
      { params: Promise.resolve({ templateId: "tmpl-1" }) },
    );

    expect(response.status).toBe(204);
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/space-templates/tmpl-1",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          "X-Yeon-User-Id": "user-1",
          "X-Yeon-Internal-Token": "internal-token",
        }),
      }),
    );
  });
});
