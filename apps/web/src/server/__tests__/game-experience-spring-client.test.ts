import { afterEach, describe, expect, it, vi } from "vitest";
import { awardGamePlayExperience } from "../game-experience-spring-client";

describe("game-experience-spring-client", () => {
  const originalSpringBackendBaseUrl = process.env.SPRING_BACKEND_BASE_URL;
  const originalSpringInternalToken = process.env.SPRING_INTERNAL_TOKEN;

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.SPRING_BACKEND_BASE_URL = originalSpringBackendBaseUrl;
    process.env.SPRING_INTERNAL_TOKEN = originalSpringInternalToken;
  });

  it("게임 플레이 경험치 적립 요청에 내부 토큰과 멱등 referenceId를 담는다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      awardGamePlayExperience(
        "00000000-0000-4000-8000-000000000001",
        "snake-io",
        "2026-06-26"
      )
    ).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://spring.test/api/v1/internal/experience/award",
      expect.objectContaining({ method: "POST" })
    );
    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("X-Yeon-Internal-Token")).toBe("internal-token");
    expect(JSON.parse(String(init?.body))).toEqual({
      userId: "00000000-0000-4000-8000-000000000001",
      activityType: "game_play",
      referenceId: "snake-io:2026-06-26",
    });
  });

  it("Spring 실패 status를 오류 메시지에 포함한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      awardGamePlayExperience(
        "00000000-0000-4000-8000-000000000001",
        "snake-io",
        "2026-06-26"
      )
    ).rejects.toThrow("게임 경험치 적립 실패: HTTP 500");
  });
});
