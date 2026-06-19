import { describe, expect, it } from "vitest";
import {
  GAME_CATALOG,
  GAME_CATEGORY_LABELS,
  getGameBySlug,
  getGameSlugs,
  getListedGames,
} from "../game-catalog";

describe("game-catalog", () => {
  it("getListedGames는 카탈로그 전체를 반환한다", () => {
    expect(getListedGames()).toEqual(GAME_CATALOG);
    expect(getListedGames().length).toBeGreaterThan(0);
  });

  it("getGameBySlug는 존재하는 slug의 게임을 반환한다", () => {
    const first = GAME_CATALOG[0];
    expect(getGameBySlug(first.slug)?.title).toBe(first.title);
  });

  it("getGameBySlug는 없는 slug면 null", () => {
    expect(getGameBySlug("존재하지-않는-게임")).toBeNull();
  });

  it("getGameSlugs는 모든 slug를 반환한다", () => {
    expect(getGameSlugs()).toEqual(GAME_CATALOG.map((g) => g.slug));
  });

  it("slug는 중복되지 않는다", () => {
    const slugs = getGameSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("모든 게임의 category에 라벨이 정의돼 있다", () => {
    for (const game of GAME_CATALOG) {
      expect(GAME_CATEGORY_LABELS[game.category]).toBeTruthy();
    }
  });

  it("모든 embedUrl은 https 절대 URL이다", () => {
    for (const game of GAME_CATALOG) {
      expect(game.embedUrl.startsWith("https://")).toBe(true);
    }
  });
});
