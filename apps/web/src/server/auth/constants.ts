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
// prod는 앱 고정 scheme만, dev는 Expo Go 딥링크(exp://, exp+yeon:// 한정)도 허용해 시뮬레이터 테스트를 연다.
// open-redirect 차단:
//   - 허용 외 scheme은 모두 null 처리.
//   - 허용 scheme이라도 host+path가 정상 앱 딥링크와 일치해야 하고, 미리 채워진 쿼리·프래그먼트는 거부.
//   - idx-145: host/path 미검증 → (host, pathname) 쌍으로 화이트리스트 검증.
//   - idx-146: exp+ 과범위 → 정확한 앱 slug(exp+yeon:)만 허용. exp:// (Expo Go)는 pathname 끝 검증으로 보완.
const PRODUCTION_MOBILE_RETURN_PROTOCOLS = [
  "yeon-card-service:",
  "chat-service:",
];

// 정상 앱 딥링크의 (host, pathname) 쌍.
// Expo Linking.createURL("auth/social") → "<scheme>://auth/social"
// URL API 파싱: host="auth", pathname="/social".
const ALLOWED_MOBILE_RETURN_HOST = "auth";
const ALLOWED_MOBILE_RETURN_PATHNAME = "/social";

// Expo Go dev URL 형식: exp://127.0.0.1:<port>/--/auth/social
// pathname 끝 suffix로 검증(host는 로컬 IP 가변).
const EXPO_GO_ALLOWED_PATHNAME_SUFFIX = "/--/auth/social";

function isAllowedMobileReturnPath(parsed: URL): boolean {
  return (
    parsed.host === ALLOWED_MOBILE_RETURN_HOST &&
    parsed.pathname === ALLOWED_MOBILE_RETURN_PATHNAME
  );
}

export function normalizeMobileReturnUrl(candidate: string | null | undefined) {
  if (!candidate) {
    return null;
  }

  const trimmed = candidate.trim();

  // 줄바꿈/공백은 헤더 인젝션 위험 → 거부.
  if (trimmed.length === 0 || /\s/.test(trimmed)) {
    return null;
  }

  let parsed: URL;

  try {
    parsed = createYeonUrl(trimmed);
  } catch {
    return null;
  }

  const { protocol, search, hash } = parsed;

  // 미리 채워진 쿼리·프래그먼트는 토큰 전달 경로 오염 위험 → 거부.
  if (search || hash) {
    return null;
  }

  if (PRODUCTION_MOBILE_RETURN_PROTOCOLS.includes(protocol)) {
    // host+pathname이 허용된 딥링크 경로와 일치해야만 통과.
    if (!isAllowedMobileReturnPath(parsed)) {
      return null;
    }
    return trimmed;
  }

  if (process.env.NODE_ENV !== "production") {
    // idx-146: exp+yeon: 정확한 slug만 허용(exp+anything 과범위 차단).
    if (protocol === "exp+yeon:") {
      if (!isAllowedMobileReturnPath(parsed)) {
        return null;
      }
      return trimmed;
    }

    // Expo Go 개발용: exp:// (로컬 IP 가변) — pathname 끝 suffix 검증.
    if (protocol === "exp:") {
      if (!parsed.pathname.endsWith(EXPO_GO_ALLOWED_PATHNAME_SUFFIX)) {
        return null;
      }
      return trimmed;
    }
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
