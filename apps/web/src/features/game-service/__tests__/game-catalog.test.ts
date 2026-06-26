import { describe, expect, it } from "vitest";
import {
  GAME_CATALOG,
  GAME_CATEGORY_LABELS,
  getGameBySlug,
  getGameEmbedKey,
  getGameSlugs,
  getListedGames,
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
});
