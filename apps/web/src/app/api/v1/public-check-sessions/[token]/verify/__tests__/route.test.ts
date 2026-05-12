import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) =>
    Response.json({ message }, { status }),
}));

vi.mock("@/server/public-check-device-cookie-bff", () => ({
  applyRememberedPublicCheckIdentityCookie: vi.fn(),
}));

describe("/api/v1/public-check-sessions/[token]/verify", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("POST: Spring verify를 호출하고 result 응답을 유지한다", async () => {
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            spaceId: "space-1",
            result: {
              verificationStatus: "matched",
              message: "본인 확인이 완료되었습니다.",
              matchedMemberName: "홍길동",
            },
            rememberedMemberId: "member-1",
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
      )
    );

    const { POST } = await import("../route");
    const response = await POST(
      new Request(
        "http://localhost/api/v1/public-check-sessions/token123/verify",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: "홍길동", phoneLast4: "1234" }),
        }
      ) as never,
      { params: Promise.resolve({ token: "token123" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.verificationStatus).toBe("matched");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/public-check-sessions/token123/verify",
      expect.objectContaining({ method: "POST" })
    );
  });
});
