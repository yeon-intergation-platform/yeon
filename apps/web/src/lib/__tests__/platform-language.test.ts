import { describe, expect, it } from "vitest";
import {
  DEFAULT_PLATFORM_LANGUAGE,
  PLATFORM_LANGUAGES,
  isPlatformLanguage,
  normalizePlatformLanguage,
  readPlatformLanguagePreference,
} from "../platform-language";

describe("platform-language", () => {
  it("지원 언어 입력을 ko/en으로 정규화한다", () => {
    expect(normalizePlatformLanguage("ko")).toBe(PLATFORM_LANGUAGES.ko);
    expect(normalizePlatformLanguage("ko-KR")).toBe(PLATFORM_LANGUAGES.ko);
    expect(normalizePlatformLanguage(" en-US ")).toBe(PLATFORM_LANGUAGES.en);
    expect(normalizePlatformLanguage("fr-FR")).toBe(DEFAULT_PLATFORM_LANGUAGE);
    expect(normalizePlatformLanguage(null)).toBe(DEFAULT_PLATFORM_LANGUAGE);
  });

  it("플랫폼 언어 union 경계를 명확히 판별한다", () => {
    expect(isPlatformLanguage("ko")).toBe(true);
    expect(isPlatformLanguage("en")).toBe(true);
    expect(isPlatformLanguage("en-US")).toBe(false);
    expect(isPlatformLanguage(undefined)).toBe(false);
  });

  it("서버 환경에서는 브라우저 저장소 없이 기본 언어를 반환한다", () => {
    expect(readPlatformLanguagePreference()).toBe(DEFAULT_PLATFORM_LANGUAGE);
  });

  it("서버에서 넘긴 초기 언어를 브라우저 저장소가 없을 때 fallback으로 쓴다", () => {
    expect(readPlatformLanguagePreference(PLATFORM_LANGUAGES.en)).toBe(
      PLATFORM_LANGUAGES.en
    );
  });
});
