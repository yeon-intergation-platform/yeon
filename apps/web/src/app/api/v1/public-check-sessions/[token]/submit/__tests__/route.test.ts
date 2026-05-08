import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) => Response.json({ message }, { status }),
}));

vi.mock("@/server/services/public-check-device-cookie", () => ({
  applyRememberedPublicCheckIdentityCookie: vi.fn(),
  clearRememberedPublicCheckIdentityCookie: vi.fn(),
  getRememberedPublicCheckIdentities: vi.fn(() => [{ spaceId: "space-1", memberId: "member-1" }]),
}));

describe("/api/v1/public-check-sessions/[token]/submit", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("POST: Spring submit을 호출하고 result 응답을 유지한다", async () => {
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      spaceId: "space-1",
      result: {
        verificationStatus: "matched",
        message: "출석과 과제 체크가 완료되었습니다.",
        matchedMemberName: "홍길동",
      },
      rememberedMemberId: "member-1",
      shouldClearRememberedIdentity: false,
    }), { status: 200, headers: { "content-type": "application/json" } })));

    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost/api/v1/public-check-sessions/token123/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ method: "qr", name: "홍길동", phoneLast4: "1234", assignmentStatus: "done", assignmentLink: null, latitude: null, longitude: null }),
    }) as never, { params: Promise.resolve({ token: "token123" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.verificationStatus).toBe("matched");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/public-check-sessions/token123/submit",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ method: "qr", name: "홍길동", phoneLast4: "1234", assignmentStatus: "done", assignmentLink: null, latitude: null, longitude: null, remembered: ["space-1:member-1"] }),
      }),
    );
  });
});
