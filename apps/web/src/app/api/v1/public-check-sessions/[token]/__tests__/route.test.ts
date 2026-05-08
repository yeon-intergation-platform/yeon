import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) => Response.json({ message }, { status }),
}));

vi.mock("@/server/services/public-check-device-cookie", () => ({
  clearRememberedPublicCheckIdentityCookie: vi.fn(),
  getRememberedPublicCheckIdentities: vi.fn(() => [{ spaceId: "space-1", memberId: "member-1" }]),
}));

describe("/api/v1/public-check-sessions/[token]", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("GET: Spring session runtime을 호출하고 응답 shape를 유지한다", async () => {
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      spaceId: "space-1",
      session: {
        title: "오늘 출석 체크",
        checkMode: "attendance_and_assignment",
        enabledMethods: ["qr", "location"],
        locationLabel: "강남 강의실",
        requiresPhoneLast4: false,
        rememberedMemberName: "홍길동",
      },
      shouldClearRememberedIdentity: false,
    }), { status: 200, headers: { "content-type": "application/json" } })));

    const { GET } = await import("../route");
    const request = new Request("http://localhost/api/v1/public-check-sessions/token123?entry=qr", { method: "GET" }) as Request & { nextUrl?: URL };
    request.nextUrl = new URL(request.url);
    const response = await GET(request as never, { params: Promise.resolve({ token: "token123" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.rememberedMemberName).toBe("홍길동");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/public-check-sessions/token123?entry=qr&remembered=space-1%3Amember-1",
      expect.objectContaining({
        headers: expect.objectContaining({ "X-Yeon-Internal-Token": "internal-token" }),
      }),
    );
  });
});
