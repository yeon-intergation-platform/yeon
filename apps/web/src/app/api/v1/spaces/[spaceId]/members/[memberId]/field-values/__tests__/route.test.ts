import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("/api/v1/spaces/[spaceId]/members/[memberId]/field-values", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("GET: fieldDefinitionId query를 Spring으로 전달하고 values 응답을 유지한다", async () => {
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
            values: [
              {
                fieldDefinitionId: "mfd_status",
                fieldType: "select",
                fieldName: "상태",
                valueText: null,
                valueNumber: null,
                valueBoolean: null,
                valueJson: ["in_progress"],
              },
            ],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    const { GET } = await import("../route");
    const request = new Request(
      "http://localhost/api/v1/spaces/space_alpha/members/mem_1/field-values?fieldDefinitionId=mfd_status",
      { method: "GET" },
    ) as Request & { nextUrl?: URL };
    request.nextUrl = new URL(request.url);

    const response = await GET(request as never, {
      params: Promise.resolve({ spaceId: "space_alpha", memberId: "mem_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.values[0].fieldDefinitionId).toBe("mfd_status");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/members/mem_1/field-values?fieldDefinitionId=mfd_status",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "X-Yeon-User-Id": "user-1",
          "X-Yeon-Internal-Token": "internal-token",
        }),
      }),
    );
  });

  test("GET: Spring 404는 jsonError로 번역한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      currentUser: { id: "user-1" },
      response: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ code: "MEMBER_NOT_FOUND", message: "수강생을 찾지 못했습니다." }),
          { status: 404, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const { GET } = await import("../route");
    const request = new Request(
      "http://localhost/api/v1/spaces/space_alpha/members/missing/field-values",
      { method: "GET" },
    ) as Request & { nextUrl?: URL };
    request.nextUrl = new URL(request.url);

    const response = await GET(request as never, {
      params: Promise.resolve({ spaceId: "space_alpha", memberId: "missing" }),
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "수강생을 찾지 못했습니다." });
  });

  test("PATCH: bulk upsert 요청을 Spring으로 전달하고 values 응답을 유지한다", async () => {
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
            ok: true,
            values: [
              {
                fieldDefinitionId: "mfd_status",
                fieldType: "select",
                fieldName: "상태",
                valueText: null,
                valueNumber: null,
                valueBoolean: null,
                valueJson: ["in_progress"],
              },
            ],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    const { PATCH } = await import("../route");
    const response = await PATCH(
      new Request("http://localhost/api/v1/spaces/space_alpha/members/mem_1/field-values", {
        method: "PATCH",
        body: JSON.stringify({ values: [{ fieldDefinitionId: "mfd_status", value: ["in_progress"] }] }),
        headers: { "content-type": "application/json" },
      }) as never,
      { params: Promise.resolve({ spaceId: "space_alpha", memberId: "mem_1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.values[0].fieldDefinitionId).toBe("mfd_status");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/members/mem_1/field-values",
      expect.objectContaining({
        method: "PATCH",
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
          JSON.stringify({ code: "FIELD_DEFINITION_NOT_FOUND", message: "필드 정의를 찾지 못했습니다." }),
          { status: 404, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const { PATCH } = await import("../route");
    const response = await PATCH(
      new Request("http://localhost/api/v1/spaces/space_alpha/members/mem_1/field-values", {
        method: "PATCH",
        body: JSON.stringify({ values: [{ fieldDefinitionId: "missing", value: "x" }] }),
        headers: { "content-type": "application/json" },
      }) as never,
      { params: Promise.resolve({ spaceId: "space_alpha", memberId: "mem_1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "필드 정의를 찾지 못했습니다." });
  });
});
