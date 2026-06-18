import { describe, expect, it } from "vitest";
import { resolveSectionBrandHref } from "../header-brand-nav";

const PLATFORM = "https://yeon.world";

describe("resolveSectionBrandHref", () => {
  describe("subdomain 환경 (prefix 없는 pathname)", () => {
    it("하위 화면 → 서비스 홈('/')", () => {
      expect(resolveSectionBrandHref("/card-service", "/decks", PLATFORM)).toBe(
        "/"
      );
    });

    it("깊은 화면도 서비스 홈 직행", () => {
      expect(
        resolveSectionBrandHref("/card-service", "/decks/123/play", PLATFORM)
      ).toBe("/");
    });

    it("서비스 홈('/') → 플랫폼 절대 URL", () => {
      expect(resolveSectionBrandHref("/card-service", "/", PLATFORM)).toBe(
        PLATFORM
      );
    });

    it("콘텐츠 채널: 기사 → 채널 홈", () => {
      expect(
        resolveSectionBrandHref("/news", "/ai/some-article", PLATFORM)
      ).toBe("/");
    });
  });

  describe("root/dev domain 환경 (prefix 포함 pathname)", () => {
    it("하위 화면 → 서비스 홈(basePath)", () => {
      expect(
        resolveSectionBrandHref(
          "/card-service",
          "/card-service/decks",
          PLATFORM
        )
      ).toBe("/card-service");
    });

    it("서비스 홈(basePath) → 플랫폼 루트('/')", () => {
      expect(
        resolveSectionBrandHref("/card-service", "/card-service", PLATFORM)
      ).toBe("/");
    });

    it("trailing slash 서비스 홈도 플랫폼 루트", () => {
      expect(
        resolveSectionBrandHref("/card-service", "/card-service/", PLATFORM)
      ).toBe("/");
    });

    it("콘텐츠 채널: 기사 → 채널 홈(basePath)", () => {
      expect(
        resolveSectionBrandHref("/news", "/news/ai/some-article", PLATFORM)
      ).toBe("/news");
    });
  });

  describe("경계값", () => {
    it("pathname null이면 '/'로 간주(서비스 홈 취급 → 플랫폼)", () => {
      expect(resolveSectionBrandHref("/card-service", null, PLATFORM)).toBe(
        PLATFORM
      );
    });

    it("유사 prefix(다른 서비스)는 prefix로 보지 않음", () => {
      // "/card-services-extra"는 "/card-service"의 하위가 아니다.
      expect(
        resolveSectionBrandHref(
          "/card-service",
          "/card-services-extra",
          PLATFORM
        )
      ).toBe("/");
    });
  });
});
