import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GameLikeRequestError,
  getLikeRanking,
  getLikeStatus,
  toggleLike,
} from "../game-likes-spring-client";

describe("game-likes-spring-client", () => {
  const originalSpringBackendBaseUrl = process.env.SPRING_BACKEND_BASE_URL;
  const originalSpringInternalToken = process.env.SPRING_INTERNAL_TOKEN;

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.SPRING_BACKEND_BASE_URL = originalSpringBackendBaseUrl;
    process.env.SPRING_INTERNAL_TOKEN = originalSpringInternalToken;
  });

  it("좋아요 조회는 gameSlug와 선택적 userId를 Spring BFF 헤더로 전달한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        count: 7,
        liked: true,
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getLikeStatus("snake-io", "00000000-0000-4000-8000-000000000001")
    ).resolves.toEqual({ count: 7, liked: true });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://spring.test/game-service/likes?gameSlug=snake-io",
      expect.objectContaining({ method: "GET", cache: "no-store" })
    );
    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(headers.get("X-Yeon-User-Id")).toBe(
      "00000000-0000-4000-8000-000000000001"
    );
    expect(headers.get("X-Yeon-Internal-Token")).toBe("internal-token");
  });

  it("좋아요 토글 실패는 Spring message와 status를 보존한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json(
        { message: "게임을 찾을 수 없습니다." },
        {
          status: 404,
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      toggleLike("missing-game", "00000000-0000-4000-8000-000000000001")
    ).rejects.toMatchObject({
      name: "GameLikeRequestError",
      message: "게임을 찾을 수 없습니다.",
      status: 404,
    } satisfies Partial<GameLikeRequestError>);
  });

  it("좋아요 랭킹 조회 실패는 빈 목록으로 degrade한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLikeRanking(10)).resolves.toEqual({ items: [] });
  });
});
