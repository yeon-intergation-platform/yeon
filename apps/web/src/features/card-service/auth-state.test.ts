import { describe, expect, it, vi } from "vitest";
import { fetchCurrentCardServiceAuthState } from "./auth-state";

describe("fetchCurrentCardServiceAuthState", () => {
  it("현재 쿠키 세션 확인 API를 no-store/include로 호출하고 authenticated 값을 반환한다", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ authenticated: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );

    await expect(fetchCurrentCardServiceAuthState(fetchMock)).resolves.toBe(
      true
    );
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/auth/session", {
      cache: "no-store",
      credentials: "include",
    });
  });

  it("세션 확인 API가 실패하면 현재 서버 렌더 상태를 유지할 수 있도록 null을 반환한다", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: "error" }), { status: 500 })
      );

    await expect(
      fetchCurrentCardServiceAuthState(fetchMock)
    ).resolves.toBeNull();
  });
});
