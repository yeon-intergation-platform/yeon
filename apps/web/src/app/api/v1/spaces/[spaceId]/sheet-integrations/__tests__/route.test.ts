import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("/api/v1/spaces/[spaceId]/sheet-integrations", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("GET: Spring integration list 결과를 그대로 반환한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ integrations: [{ publicId: "sht_1", sheetId: "sheet-1" }] }), { status: 200, headers: { "content-type": "application/json" } })));

    const { GET } = await import("../route");
    const response = await GET(new Request("http://localhost/api/v1/spaces/space_alpha/sheet-integrations") as never, { params: Promise.resolve({ spaceId: "space_alpha" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ integrations: [{ publicId: "sht_1", sheetId: "sheet-1" }] });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/sheet-integrations",
      expect.objectContaining({ method: "GET" }),
    );
  });

  test("POST: 생성 요청을 Spring으로 전달하고 201을 유지한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ integration: { publicId: "sht_1", sheetId: "sheet-1" } }), { status: 201, headers: { "content-type": "application/json" } })));

    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost/api/v1/spaces/space_alpha/sheet-integrations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sheetUrl: "https://docs.google.com/spreadsheets/d/sheet-1/edit", dataType: "attendance", columnMapping: { nameColumn: 0 } }),
    }) as never, { params: Promise.resolve({ spaceId: "space_alpha" }) });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.integration.publicId).toBe("sht_1");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/sheet-integrations",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ sheetUrl: "https://docs.google.com/spreadsheets/d/sheet-1/edit", dataType: "attendance", columnMapping: { nameColumn: 0 } }),
      }),
    );
  });
});
