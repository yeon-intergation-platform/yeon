import { beforeEach, describe, expect, test, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
  requireAuthenticatedUser,
}));

describe("/api/v1/spaces/[spaceId]/public-check-sessions/[sessionId]", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("PATCH: Spring update를 호출하고 session 응답을 유지한다", async () => {
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
            session: {
              id: "pcs_1",
              title: "체크인",
              status: "closed",
              checkMode: "attendance_and_assignment",
              enabledMethods: ["qr"],
              publicPath: "/check/token123",
              opensAt: null,
              closesAt: "2026-05-08T09:00:00.000Z",
              locationLabel: null,
              radiusMeters: null,
              createdAt: "2026-05-08T07:00:00.000Z",
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const { PATCH } = await import("../route");
    const response = await PATCH(
      new Request("http://localhost/api/v1/spaces/space_alpha/public-check-sessions/pcs_1", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "closed", closesAt: "2026-05-08T09:00:00.000Z" }),
      }) as never,
      { params: Promise.resolve({ spaceId: "space_alpha", sessionId: "pcs_1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.session.id).toBe("pcs_1");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/spaces/space_alpha/public-check-sessions/pcs_1",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          "X-Yeon-User-Id": "user-1",
          "X-Yeon-Internal-Token": "internal-token",
        }),
      }),
    );
  });
});
