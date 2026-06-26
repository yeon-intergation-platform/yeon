import { describe, expect, it } from "vitest";
import {
  GAME_CATALOG,
  GAME_CATEGORY_LABELS,
  GAME_COLLECTIONS,
  GAME_HUB_TABS,
  GAME_REGIONS,
  getGameBySlug,
  getCollectionGames,
  getFeaturedGamesForRegion,
  getGameEmbedKey,
  getGameSlugs,
  getGameTags,
  getListedGames,
  isGameCollection,
  isGameRegion,
  resolveRegionFromCountry,
} from "../game-catalog";

describe("game-catalog", () => {
  it("getListedGames는 카탈로그 전체를 반환한다", () => {
    expect(getListedGames()).toEqual(GAME_CATALOG);
    expect(getListedGames().length).toBeGreaterThan(0);
  });

  it("정적 sitemap 대상 게임 29개를 유지한다", () => {
    expect(getListedGames()).toHaveLength(29);
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

  it("slug와 노출 텍스트는 비어 있거나 URL 비호환 형식이면 안 된다", () => {
    for (const game of GAME_CATALOG) {
      expect(game.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(game.title.trim()).toBe(game.title);
      expect(game.title).not.toBe("");
      expect(game.summary.trim()).toBe(game.summary);
      expect(game.summary).not.toBe("");
      expect(game.description.trim()).toBe(game.description);
      expect(game.description).not.toBe("");
      expect(game.provider.trim()).toBe(game.provider);
      expect(game.provider).not.toBe("");
      expect(game.controls.length).toBeGreaterThan(0);
      for (const control of game.controls) {
        expect(control.trim()).toBe(control);
        expect(control).not.toBe("");
      }
    }
  });

  it("embed 식별자는 중복되지 않는다", () => {
    const embedKeys = GAME_CATALOG.map((game) =>
      getGameEmbedKey(game.embedUrl)
    );
    expect(new Set(embedKeys).size).toBe(embedKeys.length);
  });

  it("모든 게임의 category에 라벨이 정의돼 있다", () => {
    for (const game of GAME_CATALOG) {
      expect(GAME_CATEGORY_LABELS[game.category]).toBeTruthy();
    }
  });

  it("iframe 게임은 https URL, swf 게임은 호스팅 경로를 가진다", () => {
    for (const game of getListedGames()) {
      if (game.kind === "swf") {
        expect(game.embedUrl.startsWith("/")).toBe(true);
      } else {
        expect(game.embedUrl.startsWith("https://")).toBe(true);
      }
    }
  });

  it("region 판별과 국가 코드 정규화 경계를 유지한다", () => {
    expect(isGameRegion("kr")).toBe(true);
    expect(isGameRegion("us")).toBe(true);
    expect(isGameRegion("global")).toBe(true);
    expect(isGameRegion("KR")).toBe(false);
    expect(isGameRegion(null)).toBe(false);

    expect(resolveRegionFromCountry("KR")).toBe(GAME_REGIONS.kr);
    expect(resolveRegionFromCountry(" kr ")).toBe(GAME_REGIONS.kr);
    expect(resolveRegionFromCountry("US")).toBe(GAME_REGIONS.us);
    expect(resolveRegionFromCountry(undefined)).toBe(GAME_REGIONS.us);
  });

  it("region별 추천 게임은 curated catalog 내부 slug만 사용한다", () => {
    const catalogSlugs = new Set(getGameSlugs());
    for (const region of Object.values(GAME_REGIONS)) {
      const featuredGames = getFeaturedGamesForRegion(region);
      expect(featuredGames.length).toBeGreaterThan(0);
      for (const game of featuredGames) {
        expect(catalogSlugs.has(game.slug)).toBe(true);
      }
    }
  });

  it("collection 판별과 컬렉션별 노출 경계를 유지한다", () => {
    expect(isGameCollection("featured")).toBe(true);
    expect(isGameCollection("retro")).toBe(true);
    expect(isGameCollection("popular")).toBe(true);
    expect(isGameCollection("rpgmaker")).toBe(true);
    expect(isGameCollection("twoPlayer")).toBe(true);
    expect(isGameCollection("puzzle")).toBe(false);
    expect(isGameCollection(undefined)).toBe(false);

    expect(
      getCollectionGames(GAME_COLLECTIONS.retro, GAME_REGIONS.kr).every(
        (game) => game.kind === "swf"
      )
    ).toBe(true);
    expect(
      getCollectionGames(GAME_COLLECTIONS.twoPlayer, GAME_REGIONS.kr).map(
        (game) => game.slug
      )
    ).toEqual([
      "rooftop-snipers",
      "getaway-shootout",
      "fireboy-and-watergirl-the-forest-temple",
      "smash-karts",
      "bullet-force",
      "snake-io",
    ]);
  });

  it("hub tab key와 label은 중복되거나 비어 있으면 안 된다", () => {
    const keys = GAME_HUB_TABS.map((tab) => tab.key);
    expect(new Set(keys).size).toBe(keys.length);

    for (const tab of GAME_HUB_TABS) {
      expect(tab.label.trim()).toBe(tab.label);
      expect(tab.label).not.toBe("");
    }
  });

  it("게임 태그는 카테고리 라벨을 앞에 두고 중복 없이 노출한다", () => {
    for (const game of GAME_CATALOG) {
      const tags = getGameTags(game);
      expect(tags[0]).toBe(GAME_CATEGORY_LABELS[game.category]);
      expect(new Set(tags).size).toBe(tags.length);
      expect(tags.every((tag) => tag.trim() === tag && tag !== "")).toBe(true);
    }
  });
});
