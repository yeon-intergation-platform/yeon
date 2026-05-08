import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("POST /api/v1/space-templates/[templateId]/duplicate", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("Spring backend duplicate 결과를 그대로 반환한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ template: { id: "tpl_dup", name: "원본 복사본" } }), {
          status: 201,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost/api/v1/space-templates/tpl_1/duplicate", { method: "POST" }) as never,
      { params: Promise.resolve({ templateId: "tpl_1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ template: { id: "tpl_dup", name: "원본 복사본" } });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/space-templates/tpl_1/duplicate",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Yeon-User-Id": "user-1",
          "X-Yeon-Internal-Token": "internal-token",
        }),
      }),
    );
  });

  test("Spring 404는 그대로 jsonError로 번역한다", async () => {
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

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost/api/v1/space-templates/missing/duplicate", { method: "POST" }) as never,
      { params: Promise.resolve({ templateId: "missing" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "템플릿을 찾지 못했습니다." });
  });
});
