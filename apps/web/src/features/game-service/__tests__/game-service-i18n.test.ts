import { describe, expect, it } from "vitest";
import { GAME_CATALOG, GAME_REGIONS } from "../game-catalog";
import {
  getGameServiceText,
  getLanguageDefaultGameRegion,
  getLocalizedGameCategoryLabel,
  getLocalizedGameCollectionLabel,
  getLocalizedGameTags,
  getLocalizedGameText,
} from "../game-service-i18n";

const HANGUL_PATTERN = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;

describe("game-service-i18n", () => {
  it("영어 언어 설정은 미국 추천 지역을 기본값으로 쓴다", () => {
    expect(getLanguageDefaultGameRegion("en")).toBe(GAME_REGIONS.us);
    expect(getLanguageDefaultGameRegion("ko")).toBe(GAME_REGIONS.kr);
  });

  it("게임 서비스 핵심 라벨을 언어별로 제공한다", () => {
    expect(getGameServiceText("ko").startGame).toBe("게임 시작");
    expect(getGameServiceText("en").startGame).toBe("Start game");
    expect(getLocalizedGameCategoryLabel("puzzle", "en")).toBe("Puzzle");
    expect(getLocalizedGameCollectionLabel("featured", "en")).toBe(
      "Editor picks"
    );
  });

  it("영어 모드 게임 카드와 상세 설명에는 한국어 원문이 섞이지 않는다", () => {
    for (const game of GAME_CATALOG) {
      const text = getLocalizedGameText(game, "en");
      const tags = getLocalizedGameTags(game, "en");

      expect(text.title).not.toMatch(HANGUL_PATTERN);
      expect(text.summary).not.toMatch(HANGUL_PATTERN);
      expect(text.description).not.toMatch(HANGUL_PATTERN);
      expect(text.controls.join(" ")).not.toMatch(HANGUL_PATTERN);
      expect(tags.join(" ")).not.toMatch(HANGUL_PATTERN);
    }
  });
});
