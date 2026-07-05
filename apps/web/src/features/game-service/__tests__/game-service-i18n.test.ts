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

  it("영어 모드 상호작용 문구에는 한국어가 섞이지 않는다", () => {
    const text = getGameServiceText("en");
    const values = [
      text.metadataTitle,
      text.metadataDescription,
      text.swfOverlayLoading,
      text.swfOverlayDescription,
      text.like.loadError,
      text.like.loginRequired,
      text.like.actionFailed,
      text.favorite.loadError,
      text.favorite.loginRequired,
      text.favorite.actionFailed,
      text.comments.heading,
      text.comments.loadError,
      text.comments.contentRequired,
      text.comments.nicknameRequired,
      text.comments.passwordRequired,
      text.comments.submitFailed,
      text.comments.passwordPrompt,
      text.comments.revealFailed,
      text.comments.deleteConfirm,
      text.comments.deleteFailed,
      text.comments.nicknamePlaceholder,
      text.comments.passwordPlaceholder,
      text.comments.contentPlaceholder,
      text.comments.secretLabel,
      text.comments.submitting,
      text.comments.submit,
      text.comments.latest,
      text.comments.popular,
      text.comments.empty,
      text.comments.guest,
      text.comments.secretComment,
      text.comments.likeLabel,
      text.comments.revealWithPassword,
      text.comments.delete,
    ];

    expect(values.join(" ")).not.toMatch(HANGUL_PATTERN);
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
