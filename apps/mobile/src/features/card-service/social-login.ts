import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { getMobileApiBaseUrl } from "../../services/api-base-url";

// 콜드 스타트 중 떠 있던 인증 세션을 정리(권장 패턴).
WebBrowser.maybeCompleteAuthSession();

export type MobileSocialProvider = "google" | "kakao";

export type MobileSocialLoginResult =
  | { status: "success"; sessionToken: string; expiresAt: string | null }
  | { status: "cancelled" }
  | { status: "error"; message: string };

// 웹 OAuth 콜백이 딥링크로 돌려주는 오류 코드 → 한국어 메시지.
// 코드 자체는 buildAuthErrorRedirectPath/authErrorCodes와 동일 어휘.
const SOCIAL_ERROR_MESSAGES: Record<string, string> = {
  provider_denied: "로그인이 취소되었거나 공급자에서 거부했습니다.",
  invalid_state: "로그인 세션이 만료되었습니다. 다시 시도해 주세요.",
  missing_code: "로그인 응답이 올바르지 않습니다. 다시 시도해 주세요.",
  server_error:
    "로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
};

function firstQueryValue(value: string | string[] | undefined | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

function resolveSocialErrorMessage(code: string) {
  return (
    SOCIAL_ERROR_MESSAGES[code] ??
    "로그인 처리 중 문제가 발생했습니다. 다시 시도해 주세요."
  );
}

// 웹 OAuth 콜백을 그대로 재사용하고, 마지막에 세션 토큰만 딥링크로 받는다.
// ASWebAuthenticationSession(시스템 인증 세션)이라 Google disallowed_useragent를 피한다.
export async function startMobileSocialLogin(
  provider: MobileSocialProvider
): Promise<MobileSocialLoginResult> {
  const returnUrl = Linking.createURL("auth/social");
  const startUrl = `${getMobileApiBaseUrl()}/api/auth/${provider}?mobileReturnUrl=${encodeURIComponent(
    returnUrl
  )}`;

  const result = await WebBrowser.openAuthSessionAsync(startUrl, returnUrl);

  if (result.type !== "success") {
    // dismiss/cancel/locked 등은 사용자 취소로 본다.
    return { status: "cancelled" };
  }

  // idx-141: returnUrl scheme/host/path 일치 검증.
  // Linking.parse는 커스텀 scheme URL을 host/path로 분해한다.
  const expectedParsed = Linking.parse(returnUrl);
  const resultParsed = Linking.parse(result.url);

  if (
    resultParsed.scheme !== expectedParsed.scheme ||
    resultParsed.hostname !== expectedParsed.hostname ||
    resultParsed.path !== expectedParsed.path
  ) {
    return {
      status: "error",
      message: "로그인 응답 URL이 유효하지 않습니다. 다시 시도해 주세요.",
    };
  }

  const parsed = resultParsed;
  const errorCode = firstQueryValue(parsed.queryParams?.error);

  if (errorCode) {
    return { status: "error", message: resolveSocialErrorMessage(errorCode) };
  }

  const sessionToken = firstQueryValue(parsed.queryParams?.token);

  if (!sessionToken) {
    return {
      status: "error",
      message: "로그인 응답에 세션 토큰이 없습니다. 다시 시도해 주세요.",
    };
  }

  // idx-140: expiresAt도 파싱해 반환(SecureStore 저장은 호출부 책임).
  const expiresAt = firstQueryValue(parsed.queryParams?.expiresAt);

  return { status: "success", sessionToken, expiresAt };
}
