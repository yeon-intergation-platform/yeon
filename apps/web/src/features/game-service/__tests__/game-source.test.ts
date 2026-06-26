import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CURATED_GAMES,
  GAME_CATEGORIES,
  type GameEntry,
} from "../game-catalog";
import { fetchGameFeed } from "../game-feed";
import { getDetailGame, getGamesBySlugs, getHubGames } from "../game-source";

vi.mock("../game-feed", () => ({
  fetchGameFeed: vi.fn(),
}));

const firstCurated = CURATED_GAMES[0];

function feedGame(overrides: Partial<GameEntry> = {}): GameEntry {
  return {
    slug: "feed-only-game",
    title: "Feed Only Game",
    summary: "외부 feed에서만 내려오는 게임",
    description: "외부 feed fallback과 병합 동작을 검증하기 위한 게임입니다.",
    controls: ["마우스/탭으로 조작"],
    category: GAME_CATEGORIES.arcade,
    provider: "GameMonetize (공식 임베드)",
    embedUrl: "https://html5.gamemonetize.co/feedonlygame/",
    thumbUrl: "https://img.gamemonetize.com/feedonlygame/512x384.jpg",
    orientation: "landscape",
    ...overrides,
  };
}

describe("game-source", () => {
  beforeEach(() => {
    vi.mocked(fetchGameFeed).mockReset();
    vi.mocked(fetchGameFeed).mockResolvedValue([]);
  });

  it("curated와 feed 병합 시 같은 slug 또는 embed 게임은 한 번만 남긴다", async () => {
    vi.mocked(fetchGameFeed).mockResolvedValue([
      feedGame({ slug: firstCurated.slug }),
      feedGame({
        slug: "same-embed-feed-game",
        embedUrl: firstCurated.embedUrl,
      }),
      feedGame(),
    ]);

    const result = await getHubGames();

    expect(result.totalCount).toBe(CURATED_GAMES.length + 1);
    expect(result.games.map((game) => game.slug)).toContain("feed-only-game");
    expect(
      result.games.filter((game) => game.slug === firstCurated.slug)
    ).toHaveLength(1);
  });

  it("getGamesBySlugs는 입력 순서를 보존하고 없는 slug는 건너뛴다", async () => {
    vi.mocked(fetchGameFeed).mockResolvedValue([feedGame()]);

    const games = await getGamesBySlugs([
      "feed-only-game",
      firstCurated.slug,
      "missing-game",
    ]);

    expect(games.map((game) => game.slug)).toEqual([
      "feed-only-game",
      firstCurated.slug,
    ]);
  });

  it("getDetailGame은 curated 게임을 feed 조회 없이 반환한다", async () => {
    const game = await getDetailGame(firstCurated.slug);

    expect(game?.slug).toBe(firstCurated.slug);
    expect(fetchGameFeed).not.toHaveBeenCalled();
  });

  it("getDetailGame은 curated에 없으면 feed에서 찾고 없으면 null을 반환한다", async () => {
    vi.mocked(fetchGameFeed).mockResolvedValue([feedGame()]);

    await expect(getDetailGame("feed-only-game")).resolves.toMatchObject({
      slug: "feed-only-game",
    });
    await expect(getDetailGame("missing-game")).resolves.toBeNull();
  });
});
