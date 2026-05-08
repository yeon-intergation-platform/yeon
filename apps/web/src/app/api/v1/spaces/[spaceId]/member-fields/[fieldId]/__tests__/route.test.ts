import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("/api/v1/spaces/[spaceId]/member-fields/[fieldId]", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("PATCH는 Spring update를 호출한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ field: { id: "mfd_1", name: "변경" } }), { status: 200, headers: { "content-type": "application/json" } })));

    const { PATCH } = await import("../route");
    const request: any = new Request("http://localhost/api/v1/spaces/space_alpha/member-fields/mfd_1", {
      method: "PATCH",
      body: JSON.stringify({ name: "변경" }),
      headers: { "content-type": "application/json" },
    });
    request.nextUrl = new URL("http://localhost/api/v1/spaces/space_alpha/member-fields/mfd_1");
    const response = await PATCH(request, { params: Promise.resolve({ spaceId: "space_alpha", fieldId: "mfd_1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ field: { id: "mfd_1", name: "변경" } });
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/member-fields/mfd_1",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  test("DELETE는 Spring delete를 호출한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    const { DELETE } = await import("../route");
    const request: any = new Request("http://localhost/api/v1/spaces/space_alpha/member-fields/mfd_1", { method: "DELETE" });
    request.nextUrl = new URL("http://localhost/api/v1/spaces/space_alpha/member-fields/mfd_1");
    const response = await DELETE(request, { params: Promise.resolve({ spaceId: "space_alpha", fieldId: "mfd_1" }) });

    expect(response.status).toBe(204);
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/member-fields/mfd_1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
