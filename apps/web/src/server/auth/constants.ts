import {
  createYeonUrl,
  type YeonUrl,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { PLATFORM_HOME_HREF } from "@/lib/platform-services";

export const socialProviders = {
  google: "google",
  kakao: "kakao",
} as const;

export type SocialProvider =
  (typeof socialProviders)[keyof typeof socialProviders];

export const DEFAULT_POST_LOGIN_PATH = PLATFORM_HOME_HREF;
export const AUTH_SESSION_COOKIE_NAME = "yeon.session";
export const AUTH_OAUTH_STATE_COOKIE_NAME = "yeon.oauth.state";
export const AUTH_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
export const AUTH_OAUTH_STATE_TTL_SECONDS = 60 * 10;

const REDIRECT_PATH_BASE_URL = "https://yeon.world";

function isLegacyHomePath(pathname: string) {
  return pathname === "/home" || pathname.startsWith("/home/");
}

function isAllowedAuthRedirectPath(url: YeonUrl) {
  const pathname = url.pathname;

  return (
    pathname.startsWith("/") &&
    !pathname.startsWith("//") &&
    !pathname.startsWith("/api/") &&
    pathname !== "/auth/error" &&
    !isLegacyHomePath(pathname)
  );
}

export function normalizeAuthRedirectPath(
  candidate: string | null | undefined
) {
  if (!candidate) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  try {
    const url = createYeonUrl(candidate, REDIRECT_PATH_BASE_URL);

    if (url.origin !== REDIRECT_PATH_BASE_URL) {
      return DEFAULT_POST_LOGIN_PATH;
    }

    const normalizedPath = `${url.pathname}${url.search}${url.hash}`;

    return isAllowedAuthRedirectPath(url)
      ? normalizedPath
      : DEFAULT_POST_LOGIN_PATH;
  } catch {
    return DEFAULT_POST_LOGIN_PATH;
  }
}

// 모바일 소셜 로그인 복귀용 딥링크 허용 scheme.
// prod는 앱 고정 scheme만, dev는 Expo Go 딥링크(exp://, exp+...://)도 허용해 시뮬레이터 테스트를 연다.
// open-redirect 차단: 허용 외 scheme은 모두 null 처리.
const PRODUCTION_MOBILE_RETURN_PROTOCOLS = [
  "yeon-card-service:",
  "chat-service:",
];

export function normalizeMobileReturnUrl(candidate: string | null | undefined) {
  if (!candidate) {
    return null;
  }

  const trimmed = candidate.trim();

  // 줄바꿈/공백은 헤더 인젝션 위험 → 거부.
  if (trimmed.length === 0 || /\s/.test(trimmed)) {
    return null;
  }

  let protocol: string;

  try {
    protocol = createYeonUrl(trimmed).protocol;
  } catch {
    return null;
  }

  if (PRODUCTION_MOBILE_RETURN_PROTOCOLS.includes(protocol)) {
    return trimmed;
  }

  if (
    process.env.NODE_ENV !== "production" &&
    (protocol === "exp:" || protocol.startsWith("exp+"))
  ) {
    return trimmed;
  }

  return null;
}

export function buildAuthSessionCleanupHref(nextPath: string) {
  const url = createYeonUrl(
    "/api/auth/session/cleanup",
    REDIRECT_PATH_BASE_URL
  );

  url.searchParams.set("next", nextPath);

  return `${url.pathname}${url.search}`;
}

export function getAppOrigin(originFallback?: string) {
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? originFallback;

  if (!rawAppUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL 또는 요청 origin이 필요합니다.");
  }

  return createYeonUrl(rawAppUrl).origin;
}

function getAuthCookieDeploymentHostname() {
  try {
    return createYeonUrl(
      process.env.NEXT_PUBLIC_APP_URL ?? REDIRECT_PATH_BASE_URL
    ).hostname;
  } catch {
    return createYeonUrl(REDIRECT_PATH_BASE_URL).hostname;
  }
}

export function isSecureAuthCookie() {
  return process.env.NODE_ENV === "production";
}

export function getAuthCookieDomain() {
  if (process.env.NODE_ENV !== "production") {
    return undefined;
  }

  const hostname = getAuthCookieDeploymentHostname().toLowerCase();

  if (hostname === "yeon.world" || hostname === "www.yeon.world") {
    return ".yeon.world";
  }

  return undefined;
}
