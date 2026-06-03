import { afterEach, describe, expect, it } from "vitest";
import {
  DEFAULT_POST_LOGIN_PATH,
  buildAuthSessionCleanupHref,
  getAppOrigin,
  isSecureAuthCookie,
  normalizeAuthRedirectPath,
  normalizeMobileReturnUrl,
} from "../constants";

describe("auth constants", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const originalNodeEnv = process.env.NODE_ENV;

  function setNodeEnv(value?: string) {
    if (value === undefined) {
      Reflect.deleteProperty(process.env, "NODE_ENV");
      return;
    }

    Object.assign(process.env, { NODE_ENV: value });
  }

  afterEach(() => {
    if (originalAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    }

    setNodeEnv(originalNodeEnv);
  });

  it("정상 앱 경로는 query/hash를 유지한 채 그대로 허용한다", () => {
    expect(
      normalizeAuthRedirectPath("/counseling-service?tab=records#section")
    ).toBe("/counseling-service?tab=records#section");
  });

  it("레거시 /home 경로는 기본 상담 경로로 되돌린다", () => {
    expect(normalizeAuthRedirectPath("/home?tab=records#section")).toBe(
      DEFAULT_POST_LOGIN_PATH
    );
  });

  it("외부 origin URL은 기본 경로로 되돌린다", () => {
    expect(normalizeAuthRedirectPath("https://evil.example/login")).toBe(
      DEFAULT_POST_LOGIN_PATH
    );
  });

  it("/api 경로는 로그인 후 이동 경로로 허용하지 않는다", () => {
    expect(normalizeAuthRedirectPath("/api/v1/users")).toBe(
      DEFAULT_POST_LOGIN_PATH
    );
  });

  it("cleanup href는 next 파라미터를 안전하게 붙인다", () => {
    expect(buildAuthSessionCleanupHref("/counseling-service?tab=records")).toBe(
      "/api/auth/session/cleanup?next=%2Fcounseling-service%3Ftab%3Drecords"
    );
  });

  it("getAppOrigin은 NEXT_PUBLIC_APP_URL이 없으면 fallback origin을 사용한다", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;

    expect(getAppOrigin("https://dev.yeon.world/abc")).toBe(
      "https://dev.yeon.world"
    );
  });

  it("isSecureAuthCookie는 production에서만 true다", () => {
    setNodeEnv("production");
    expect(isSecureAuthCookie()).toBe(true);

    setNodeEnv("development");
    expect(isSecureAuthCookie()).toBe(false);
  });

  it("normalizeMobileReturnUrl은 앱 고정 scheme만 허용한다(prod 포함)", () => {
    setNodeEnv("production");
    expect(normalizeMobileReturnUrl("yeon-card-service://auth/social")).toBe(
      "yeon-card-service://auth/social"
    );
    expect(normalizeMobileReturnUrl("chat-service://auth/social")).toBe(
      "chat-service://auth/social"
    );
  });

  it("normalizeMobileReturnUrl은 http/외부 scheme과 빈 값을 거부한다", () => {
    setNodeEnv("production");
    expect(normalizeMobileReturnUrl("https://evil.example/steal")).toBeNull();
    expect(normalizeMobileReturnUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeMobileReturnUrl(null)).toBeNull();
    expect(normalizeMobileReturnUrl(" ")).toBeNull();
    // 공백/줄바꿈 포함은 헤더 인젝션 방지로 거부.
    expect(
      normalizeMobileReturnUrl("yeon-card-service://a\nLocation: x")
    ).toBeNull();
  });

  it("normalizeMobileReturnUrl은 dev에서만 Expo Go 딥링크(exp://)를 허용한다", () => {
    setNodeEnv("development");
    expect(
      normalizeMobileReturnUrl("exp://127.0.0.1:8081/--/auth/social")
    ).toBe("exp://127.0.0.1:8081/--/auth/social");

    setNodeEnv("production");
    expect(
      normalizeMobileReturnUrl("exp://127.0.0.1:8081/--/auth/social")
    ).toBeNull();
  });
});
