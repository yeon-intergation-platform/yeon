import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("/api/v1/space-templates", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("GET: 인증된 사용자는 Spring backend 결과를 그대로 반환한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ templates: [{ id: "tmpl-1" }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      )
    );

    const { GET } = await import("../route");
    const response = await GET(
      new Request("http://localhost/api/v1/space-templates") as never
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ templates: [{ id: "tmpl-1" }] });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/space-templates",
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
    const requestHeaders = (fetch as unknown as Mock).mock.calls[0][1]
      .headers as Headers;
    expect(requestHeaders.get("X-Yeon-User-Id")).toBe("user-1");
    expect(requestHeaders.get("X-Yeon-Internal-Token")).toBe("internal-token");
  });

  test("GET: Spring 404는 그대로 jsonError로 번역한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { code: "SPACE_TEMPLATE_NOT_FOUND", message: "없음" },
          }),
          {
            status: 404,
            headers: { "content-type": "application/json" },
          }
        )
      )
    );

    const { GET } = await import("../route");
    const response = await GET(
      new Request("http://localhost/api/v1/space-templates") as never
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "없음" });
  });

  test("POST: create를 Spring backend로 위임하고 201 응답을 그대로 반환한다", async () => {
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
            template: { id: "tpl_created", name: "새 템플릿" },
          }),
          {
            status: 201,
            headers: { "content-type": "application/json" },
          }
        )
      )
    );

    const { POST } = await import("../route");
    const body = {
      name: "새 템플릿",
      description: "설명",
      tabsConfig: [
        {
          name: "개요",
          tabType: "system",
          systemKey: "overview",
          displayOrder: 0,
          fields: [],
        },
      ],
    };
    const response = await POST(
      new Request("http://localhost/api/v1/space-templates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }) as never
    );
    const parsed = await response.json();

    expect(response.status).toBe(201);
    expect(parsed).toEqual({
      template: { id: "tpl_created", name: "새 템플릿" },
    });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/space-templates",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
        headers: expect.any(Headers),
      })
    );
    const requestHeaders = (fetch as unknown as Mock).mock.calls[0][1]
      .headers as Headers;
    expect(requestHeaders.get("X-Yeon-User-Id")).toBe("user-1");
    expect(requestHeaders.get("X-Yeon-Internal-Token")).toBe("internal-token");
    expect(requestHeaders.get("content-type")).toBe("application/json");
  });

  test("POST: Spring validation 400은 그대로 jsonError로 번역한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "INVALID_REQUEST",
            message: "요청 데이터가 올바르지 않습니다.",
          }),
          {
            status: 400,
            headers: { "content-type": "application/json" },
          }
        )
      )
    );

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost/api/v1/space-templates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "" }),
      }) as never
    );
    const parsed = await response.json();

    expect(response.status).toBe(400);
    expect(parsed).toEqual({ message: "요청 데이터가 올바르지 않습니다." });
  });
});
