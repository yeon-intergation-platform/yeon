import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("/api/v1/spaces/[spaceId]/member-tabs", () => {
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
        new Response(
          JSON.stringify({ tabs: [{ id: "mtb_overview", name: "개요" }] }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          }
        )
      )
    );

    const { GET } = await import("../route");
    const response = await GET(
      new Request(
        "http://localhost/api/v1/spaces/space_alpha/member-tabs"
      ) as never,
      { params: Promise.resolve({ spaceId: "space_alpha" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ tabs: [{ id: "mtb_overview", name: "개요" }] });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/member-tabs",
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

    const { GET } = await import("../route");
    const response = await GET(
      new Request(
        "http://localhost/api/v1/spaces/missing/member-tabs"
      ) as never,
      { params: Promise.resolve({ spaceId: "missing" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "스페이스를 찾지 못했습니다." });
  });

  test("POST: 생성 요청을 Spring으로 전달하고 201을 유지한다", async () => {
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
            tab: {
              id: "mtb_created",
              name: "상담 메모",
              tabType: "custom",
              systemKey: null,
              isVisible: true,
              displayOrder: 5,
            },
          }),
          {
            status: 201,
            headers: { "content-type": "application/json" },
          }
        )
      )
    );

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost/api/v1/spaces/space_alpha/member-tabs", {
        method: "POST",
        body: JSON.stringify({ name: "상담 메모" }),
        headers: { "content-type": "application/json" },
      }) as never,
      { params: Promise.resolve({ spaceId: "space_alpha" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.tab.id).toBe("mtb_created");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/member-tabs",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "상담 메모" }),
        headers: expect.any(Headers),
      })
    );
    const requestHeaders = (fetch as unknown as Mock).mock.calls[0][1]
      .headers as Headers;
    expect(requestHeaders.get("content-type")).toBe("application/json");
    expect(requestHeaders.get("X-Yeon-User-Id")).toBe("user-1");
    expect(requestHeaders.get("X-Yeon-Internal-Token")).toBe("internal-token");
  });
});
