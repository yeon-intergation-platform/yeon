import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GameLibraryRequestError,
  listFavorites,
  recordPlay,
  toggleFavorite,
} from "../game-library-spring-client";

describe("game-library-spring-client", () => {
  const originalSpringBackendBaseUrl = process.env.SPRING_BACKEND_BASE_URL;
  const originalSpringInternalToken = process.env.SPRING_INTERNAL_TOKEN;

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.SPRING_BACKEND_BASE_URL = originalSpringBackendBaseUrl;
    process.env.SPRING_INTERNAL_TOKEN = originalSpringInternalToken;
  });

  it("찜 목록 조회는 userId를 Spring BFF 헤더로 전달한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    process.env.SPRING_INTERNAL_TOKEN = "internal-token";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        slugs: ["snake-io", "2048"],
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      listFavorites("00000000-0000-4000-8000-000000000001")
    ).resolves.toEqual(["snake-io", "2048"]);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://spring.test/game-service/library/favorites",
      expect.objectContaining({ method: "GET", cache: "no-store" })
    );
    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(headers.get("X-Yeon-User-Id")).toBe(
      "00000000-0000-4000-8000-000000000001"
    );
    expect(headers.get("X-Yeon-Internal-Token")).toBe("internal-token");
  });

  it("찜 토글은 gameSlug 본문과 userId 헤더를 함께 전달한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        favorited: true,
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      toggleFavorite("00000000-0000-4000-8000-000000000001", "snake-io")
    ).resolves.toBe(true);

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("X-Yeon-User-Id")).toBe(
      "00000000-0000-4000-8000-000000000001"
    );
    expect(JSON.parse(String(init?.body))).toEqual({ gameSlug: "snake-io" });
  });

  it("최근 플레이 기록 실패는 Spring message와 status를 보존한다", async () => {
    process.env.SPRING_BACKEND_BASE_URL = "http://spring.test";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json(
        { message: "최근 플레이를 저장하지 못했습니다." },
        {
          status: 503,
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      recordPlay("00000000-0000-4000-8000-000000000001", "snake-io")
    ).rejects.toMatchObject({
      name: "GameLibraryRequestError",
      message: "최근 플레이를 저장하지 못했습니다.",
      status: 503,
    } satisfies Partial<GameLibraryRequestError>);
  });
});
