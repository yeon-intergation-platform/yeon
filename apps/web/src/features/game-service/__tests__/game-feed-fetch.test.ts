import { afterEach, describe, expect, it, vi } from "vitest";

const FEED_ITEM = {
  id: "90001",
  title: "Stable Feed Game",
  description: "Stable feed game",
  instructions: "Tap to play",
  url: "https://html5.gamemonetize.co/stablefeedgame/",
  category: "Arcade",
  tags: "arcade",
  thumb: "https://img.gamemonetize.com/stablefeedgame/512x384.jpg",
  width: "800",
  height: "600",
};

async function importFreshFeedModule() {
  vi.resetModules();
  return import("../game-feed");
}

describe("game-feed fetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("fetch 실패 시 정적 last-good snapshot으로 fallback한다", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const { fetchGameFeed } = await importFreshFeedModule();

    const games = await fetchGameFeed();

    expect(games.length).toBeGreaterThan(0);
  });

  it("HTTP 실패 시 정적 last-good snapshot으로 fallback한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn(),
      })
    );
    const { fetchGameFeed } = await importFreshFeedModule();

    const games = await fetchGameFeed();

    expect(games.length).toBeGreaterThan(0);
  });

  it("빈 배열 응답 시 기존 last-good 결과를 유지한다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue([FEED_ITEM]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      });
    vi.stubGlobal("fetch", fetchMock);
    const { fetchGameFeed } = await importFreshFeedModule();

    const first = await fetchGameFeed();
    const second = await fetchGameFeed();

    expect(first.map((game) => game.slug)).toEqual(["stable-feed-game-90001"]);
    expect(second.map((game) => game.slug)).toEqual(["stable-feed-game-90001"]);
  });

  it("성공 응답 후 실패하면 마지막 성공 결과를 반환한다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue([FEED_ITEM]),
      })
      .mockRejectedValueOnce(new Error("rate limited"));
    vi.stubGlobal("fetch", fetchMock);
    const { fetchGameFeed } = await importFreshFeedModule();

    await expect(fetchGameFeed()).resolves.toMatchObject([
      { slug: "stable-feed-game-90001" },
    ]);
    await expect(fetchGameFeed()).resolves.toMatchObject([
      { slug: "stable-feed-game-90001" },
    ]);
  });
});
