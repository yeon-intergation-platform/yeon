import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("POST /api/v1/spaces/[spaceId]/sheet-integrations/[integrationId]/sync", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("Spring sync 결과를 그대로 반환한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ synced: 3, errors: 1 }), { status: 200, headers: { "content-type": "application/json" } })));

    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost/api/v1/spaces/space_alpha/sheet-integrations/sht_1/sync", { method: "POST" }) as never, {
      params: Promise.resolve({ spaceId: "space_alpha", integrationId: "sht_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ synced: 3, errors: 1 });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/sheet-integrations/sht_1/sync",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
