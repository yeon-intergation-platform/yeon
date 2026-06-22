import { describe, expect, it } from "vitest";
import { GAME_CATEGORIES } from "../game-catalog";
import {
  decodeHtmlEntities,
  mapFeedCategory,
  mapFeedItemToGame,
  mapFeedPayloadToGames,
  toGameSlug,
} from "../game-feed";

const SAMPLE = {
  id: "80434",
  title: "Magic Knife ",
  description: "Magic knife is a casual game &mdash; throw &amp; return.",
  instructions: "- tap the head. - throw the knife.",
  url: "https://html5.gamemonetize.co/hp0gxzl1kc29lx4ayopwwumtjxbv59hw/",
  category: "Shooting",
  tags: "casual, knife",
  thumb: "https://img.gamemonetize.com/hp0gxzl1kc29lx4ayopwwumtjxbv59hw/512x384.jpg",
  width: "800",
  height: "600",
};

describe("game-feed", () => {
  it("HTML 엔티티를 디코딩한다", () => {
    expect(decodeHtmlEntities("a &amp; b &mdash; c &#65; &#x42;")).toBe(
      "a & b — c A B"
    );
  });

  it("GameMonetize 카테고리를 yeon 카테고리로 매핑한다", () => {
    expect(mapFeedCategory("Shooting")).toBe(GAME_CATEGORIES.shooting);
    expect(mapFeedCategory("Hypercasual")).toBe(GAME_CATEGORIES.casual);
    expect(mapFeedCategory(".IO")).toBe(GAME_CATEGORIES.io);
    expect(mapFeedCategory("알수없음")).toBe(GAME_CATEGORIES.arcade);
  });

  it("slug는 title 기반 + id suffix로 만든다", () => {
    expect(toGameSlug("Magic Knife ", "80434")).toBe("magic-knife-80434");
    expect(toGameSlug("!!!", "99")).toBe("game-99");
  });

  it("feed 항목을 GameEntry로 변환한다", () => {
    const game = mapFeedItemToGame(SAMPLE);
    expect(game.slug).toBe("magic-knife-80434");
    expect(game.title).toBe("Magic Knife");
    expect(game.category).toBe(GAME_CATEGORIES.shooting);
    expect(game.embedUrl).toBe(SAMPLE.url);
    expect(game.thumbUrl).toBe(SAMPLE.thumb);
    expect(game.orientation).toBe("landscape");
    expect(game.summary).not.toContain("&amp;");
    expect(game.summary).not.toContain("&mdash;");
    expect(game.controls.length).toBeGreaterThan(0);
  });

  it("portrait 해상도는 orientation이 portrait", () => {
    const game = mapFeedItemToGame({ ...SAMPLE, width: "720", height: "1280" });
    expect(game.orientation).toBe("portrait");
  });

  it("잘못된 레코드는 건너뛰고 유효한 것만 변환한다", () => {
    const games = mapFeedPayloadToGames([
      SAMPLE,
      { id: "x" }, // url/thumb 누락 → 스킵
      { ...SAMPLE, id: "1", url: "not-a-url" }, // url 형식 위반 → 스킵
    ]);
    expect(games).toHaveLength(1);
    expect(games[0]?.slug).toBe("magic-knife-80434");
  });

  it("payload가 배열이 아니면 빈 배열", () => {
    expect(mapFeedPayloadToGames({ error: "code 1015" })).toEqual([]);
  });
});
