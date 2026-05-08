import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("GET: memberId 없으면 bootstrap 후 Spring field read를 호출한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ fields: [{ id: "mfd_status" }] }), { status: 200, headers: { "content-type": "application/json" } })),
    );

    const { GET } = await import("../route");
    const request: any = new Request("http://localhost/api/v1/spaces/space_alpha/member-tabs/mtb_custom/fields");
    request.nextUrl = new URL("http://localhost/api/v1/spaces/space_alpha/member-tabs/mtb_custom/fields");
    const response = await GET(request, { params: Promise.resolve({ spaceId: "space_alpha", tabId: "mtb_custom" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ fields: [{ id: "mfd_status" }] });
    expect(fetch).toHaveBeenNthCalledWith(1, "http://127.0.0.1:8081/spaces/space_alpha/member-tabs/mtb_custom/bootstrap-overview-fields", expect.objectContaining({ method: "POST" }));
    expect(fetch).toHaveBeenNthCalledWith(2, "http://127.0.0.1:8081/spaces/space_alpha/member-tabs/mtb_custom/fields", expect.anything());
  });

  test("GET: memberId 있으면 bootstrap 후 Spring fields/values를 호출한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ fields: [{ id: "mfd_status" }] }), { status: 200, headers: { "content-type": "application/json" } }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ values: [{ fieldDefinitionId: "mfd_status", valueText: "진행중", valueNumber: null, valueBoolean: null, valueJson: null }] }), { status: 200, headers: { "content-type": "application/json" } })),
    );

    const { GET } = await import("../route");
    const request: any = new Request("http://localhost/api/v1/spaces/space_alpha/member-tabs/mtb_overview/fields?memberId=mem_1");
    request.nextUrl = new URL("http://localhost/api/v1/spaces/space_alpha/member-tabs/mtb_overview/fields?memberId=mem_1");
    const response = await GET(request, { params: Promise.resolve({ spaceId: "space_alpha", tabId: "mtb_overview" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      fields: [{ id: "mfd_status" }],
      values: [{ fieldDefinitionId: "mfd_status", valueText: "진행중", valueNumber: null, valueBoolean: null, valueJson: null }],
    });
    expect(fetch).toHaveBeenNthCalledWith(1, "http://127.0.0.1:8081/spaces/space_alpha/member-tabs/mtb_overview/bootstrap-overview-fields", expect.objectContaining({ method: "POST" }));
    expect(fetch).toHaveBeenNthCalledWith(2, "http://127.0.0.1:8081/spaces/space_alpha/member-tabs/mtb_overview/fields", expect.anything());
    expect(fetch).toHaveBeenNthCalledWith(3, "http://127.0.0.1:8081/spaces/space_alpha/member-tabs/mtb_overview/field-values?memberId=mem_1", expect.anything());
  });

  test("POST: overview가 아니면 bootstrap 에러를 무시하고 Spring create를 계속 수행한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ code: "OVERVIEW_TAB_ONLY", message: "개요 탭에서만 기본 필드 초기화를 수행할 수 있습니다." }), { status: 400, headers: { "content-type": "application/json" } }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ field: { id: "mfd_new", name: "새 필드" } }), { status: 200, headers: { "content-type": "application/json" } })),
    );

    const { POST } = await import("../route");
    const request: any = new Request("http://localhost/api/v1/spaces/space_alpha/member-tabs/mtb_custom/fields", {
      method: "POST",
      body: JSON.stringify({ name: "새 필드", fieldType: "text" }),
      headers: { "content-type": "application/json" },
    });
    request.nextUrl = new URL("http://localhost/api/v1/spaces/space_alpha/member-tabs/mtb_custom/fields");
    const response = await POST(request, { params: Promise.resolve({ spaceId: "space_alpha", tabId: "mtb_custom" }) });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ field: { id: "mfd_new", name: "새 필드" } });
    expect(fetch).toHaveBeenNthCalledWith(1, "http://127.0.0.1:8081/spaces/space_alpha/member-tabs/mtb_custom/bootstrap-overview-fields", expect.objectContaining({ method: "POST" }));
    expect(fetch).toHaveBeenNthCalledWith(2, "http://127.0.0.1:8081/spaces/space_alpha/member-tabs/mtb_custom/fields", expect.objectContaining({ method: "POST" }));
  });
});
