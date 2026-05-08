import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("/api/v1/spaces/[spaceId]/sheet-export", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("GET: Spring integration 조회 결과를 그대로 반환한다", async () => {
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
            integration: {
              publicId: "sgi_1",
              sheetUrl: "https://docs.google.com/spreadsheets/d/sheet123/edit",
              sheetId: "sheet123",
              dataType: "export",
              columnMapping: null,
              lastSyncedAt: null,
              createdAt: "2026-05-08T00:00:00.000Z",
              updatedAt: "2026-05-08T00:00:00.000Z",
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const { GET } = await import("../route");
    const response = await GET(
      new Request("http://localhost/api/v1/spaces/space_alpha/sheet-export") as never,
      { params: Promise.resolve({ spaceId: "space_alpha" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.integration.sheetId).toBe("sheet123");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/sheet-export/integration",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "X-Yeon-User-Id": "user-1",
          "X-Yeon-Internal-Token": "internal-token",
        }),
      }),
    );
  });

  test("POST: 저장 요청을 Spring upsert로 전달하고 201을 유지한다", async () => {
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
            integration: {
              publicId: "sgi_1",
              sheetUrl: "https://docs.google.com/spreadsheets/d/sheet123/edit",
              sheetId: "sheet123",
              dataType: "export",
              columnMapping: null,
              lastSyncedAt: null,
              createdAt: "2026-05-08T00:00:00.000Z",
              updatedAt: "2026-05-08T00:00:00.000Z",
            },
          }),
          { status: 201, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost/api/v1/spaces/space_alpha/sheet-export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sheetUrl: "https://docs.google.com/spreadsheets/d/sheet123/edit" }),
      }) as never,
      { params: Promise.resolve({ spaceId: "space_alpha" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.integration.publicId).toBe("sgi_1");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/sheet-export/integration",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ sheetUrl: "https://docs.google.com/spreadsheets/d/sheet123/edit" }),
      }),
    );
  });

  test("DELETE: Spring delete 결과를 그대로 반환한다", async () => {
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

    const { DELETE } = await import("../route");
    const response = await DELETE(
      new Request("http://localhost/api/v1/spaces/space_alpha/sheet-export", {
        method: "DELETE",
      }) as never,
      { params: Promise.resolve({ spaceId: "space_alpha" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/sheet-export/integration",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
