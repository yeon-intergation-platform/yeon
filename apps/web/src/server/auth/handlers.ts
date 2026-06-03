import { createYeonUrl } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { NextRequest, NextResponse } from "next/server";
import {
  type AuthErrorCode,
  AuthFlowError,
  authErrorCodes,
  buildAuthErrorRedirectPath,
} from "./auth-errors";
import {
  AUTH_OAUTH_STATE_COOKIE_NAME,
  AUTH_OAUTH_STATE_TTL_SECONDS,
  getAppOrigin,
  isSecureAuthCookie,
  normalizeMobileReturnUrl,
  type SocialProvider,
} from "./constants";
import { createPkceCodeChallenge } from "./crypto";
import {
  createOAuthStateCookieValue,
  consumeOAuthStateCookieValue,
} from "./oauth-state";
import { completeSocialAuthInSpring } from "@/server/root-auth-spring-client";
import { applyAuthSessionCookie } from "./session";
import {
  buildSocialAuthorizationUrl,
  getSocialAuthCallbackOrigin,
} from "./social-providers";

function redirectWithinApp(request: NextRequest, path: string) {
  return NextResponse.redirect(
    createYeonUrl(path, getAppOrigin(request.nextUrl.origin))
  );
}

function applyOAuthStateCookie(
  response: NextResponse,
  cookieValue?: string | null
) {
  if (!cookieValue) {
    response.cookies.set({
      name: AUTH_OAUTH_STATE_COOKIE_NAME,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureAuthCookie(),
      path: "/",
      expires: new Date(0),
    });

    return response;
  }

  response.cookies.set({
    name: AUTH_OAUTH_STATE_COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureAuthCookie(),
    path: "/",
    maxAge: AUTH_OAUTH_STATE_TTL_SECONDS,
  });

  return response;
}

// 모바일 소셜 로그인 복귀: 커스텀 scheme(yeon-card-service:// 등)으로 302.
// NextResponse.redirect은 http(s) 외 scheme을 막을 수 있어 Location 헤더를 직접 세팅한다.
function buildMobileReturnLocation(
  mobileReturnUrl: string,
  params: Record<string, string | null | undefined>
) {
  const url = createYeonUrl(mobileReturnUrl);

  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

function redirectToMobileReturn(
  mobileReturnUrl: string,
  params: Record<string, string | null | undefined>,
  oauthStateCookieValue?: string | null
) {
  const response = new NextResponse(null, {
    status: 302,
    headers: { Location: buildMobileReturnLocation(mobileReturnUrl, params) },
  });

  if (oauthStateCookieValue !== undefined) {
    applyOAuthStateCookie(response, oauthStateCookieValue);
  }

  return response;
}

function redirectToAuthError(
  request: NextRequest,
  options: {
    provider: SocialProvider;
    reason: AuthErrorCode;
    nextPath?: string | null;
    mobileReturnUrl?: string | null;
    oauthStateCookieValue?: string | null;
  }
) {
  // 모바일 플로우면 웹 에러 페이지가 아니라 딥링크로 오류를 돌려보낸다(브라우저 세션 종료).
  if (options.mobileReturnUrl) {
    return redirectToMobileReturn(
      options.mobileReturnUrl,
      { error: options.reason },
      options.oauthStateCookieValue
    );
  }

  const response = redirectWithinApp(
    request,
    buildAuthErrorRedirectPath({
      provider: options.provider,
      reason: options.reason,
      nextPath: options.nextPath,
    })
  );

  if (options.oauthStateCookieValue !== undefined) {
    applyOAuthStateCookie(response, options.oauthStateCookieValue);
  }

  return response;
}

export async function startSocialAuth(
  request: NextRequest,
  provider: SocialProvider
) {
  const requestedNextPath = request.nextUrl.searchParams.get("next");
  // 모바일 소셜 로그인: 복귀 딥링크(화이트리스트 검증된 값만 사용 — 그 외엔 null).
  const mobileReturnUrl = normalizeMobileReturnUrl(
    request.nextUrl.searchParams.get("mobileReturnUrl")
  );

  try {
    const oauthState = createOAuthStateCookieValue({
      provider,
      nextPath: requestedNextPath,
      mobileReturnUrl,
      existingCookieValue: request.cookies.get(AUTH_OAUTH_STATE_COOKIE_NAME)
        ?.value,
    });
    const authorizationUrl = buildSocialAuthorizationUrl({
      provider,
      state: oauthState.state,
      codeChallenge: createPkceCodeChallenge(oauthState.codeVerifier),
      originFallback: request.nextUrl.origin,
    });
    const response = NextResponse.redirect(authorizationUrl);
    applyOAuthStateCookie(response, oauthState.cookieValue);

    return response;
  } catch (error) {
    console.error(error);

    if (error instanceof AuthFlowError) {
      return redirectToAuthError(request, {
        provider,
        reason: error.code,
        nextPath: requestedNextPath,
        mobileReturnUrl,
      });
    }

    return redirectToAuthError(request, {
      provider,
      reason: authErrorCodes.serverError,
      nextPath: requestedNextPath,
      mobileReturnUrl,
    });
  }
}

export async function completeSocialAuth(
  request: NextRequest,
  provider: SocialProvider
) {
  const requestState = request.nextUrl.searchParams.get("state");
  const oauthState = consumeOAuthStateCookieValue({
    cookieValue: request.cookies.get(AUTH_OAUTH_STATE_COOKIE_NAME)?.value,
    provider,
    state: requestState,
  });
  const providerError = request.nextUrl.searchParams.get("error");
  const providerErrorDescription =
    request.nextUrl.searchParams.get("error_description");
  const code = request.nextUrl.searchParams.get("code");

  if (providerError) {
    // idx-152: error_description은 공급자·공격자 제어 문자열이므로 로그 인젝션 방지용 새니타이즈.
    const safeErrorDescription = providerErrorDescription
      ? providerErrorDescription.replace(/[\r\n]/g, " ").slice(0, 200)
      : undefined;
    console.error(`${provider} 로그인 공급자 오류`, {
      error: providerError,
      errorDescription: safeErrorDescription,
    });

    return redirectToAuthError(request, {
      provider,
      reason: authErrorCodes.providerDenied,
      nextPath: oauthState.matchedEntry?.nextPath,
      mobileReturnUrl: oauthState.matchedEntry?.mobileReturnUrl,
      oauthStateCookieValue: oauthState.nextCookieValue,
    });
  }

  if (!oauthState.matchedEntry) {
    return redirectToAuthError(request, {
      provider,
      reason: authErrorCodes.invalidState,
      oauthStateCookieValue: oauthState.nextCookieValue,
    });
  }

  if (!requestState || requestState !== oauthState.matchedEntry.state) {
    return redirectToAuthError(request, {
      provider,
      reason: authErrorCodes.invalidState,
      nextPath: oauthState.matchedEntry.nextPath,
      mobileReturnUrl: oauthState.matchedEntry.mobileReturnUrl,
      oauthStateCookieValue: oauthState.nextCookieValue,
    });
  }

  if (!code) {
    return redirectToAuthError(request, {
      provider,
      reason: authErrorCodes.missingCode,
      nextPath: oauthState.matchedEntry.nextPath,
      mobileReturnUrl: oauthState.matchedEntry.mobileReturnUrl,
      oauthStateCookieValue: oauthState.nextCookieValue,
    });
  }

  try {
    const session = await completeSocialAuthInSpring({
      provider,
      code,
      codeVerifier: oauthState.matchedEntry.codeVerifier,
      appOrigin: getSocialAuthCallbackOrigin(request.nextUrl.origin),
    });

    // 모바일 플로우: 쿠키 대신 딥링크로 세션 토큰을 반환(앱이 SecureStore에 저장).
    // idx-142: 세션 토큰이 쿼리스트링에 포함되어 프록시/OS 딥링크 로그에 평문 노출 위험.
    // 개선 방향: URL fragment(#token=...) 또는 일회용 exchange code 방식으로 전환 권장.
    // 현재 normalizeMobileReturnUrl이 화이트리스트 scheme/pathname을 강제해 open-redirect는 차단됨.
    if (oauthState.matchedEntry.mobileReturnUrl) {
      return redirectToMobileReturn(
        oauthState.matchedEntry.mobileReturnUrl,
        {
          token: session.sessionToken,
          expiresAt: session.expiresAt.toISOString(),
        },
        oauthState.nextCookieValue
      );
    }

    const response = redirectWithinApp(
      request,
      oauthState.matchedEntry.nextPath
    );

    applyOAuthStateCookie(response, oauthState.nextCookieValue);
    applyAuthSessionCookie(response, session);

    return response;
  } catch (error) {
    console.error(error);

    if (error instanceof AuthFlowError) {
      return redirectToAuthError(request, {
        provider,
        reason: error.code,
        nextPath: oauthState.matchedEntry.nextPath,
        mobileReturnUrl: oauthState.matchedEntry.mobileReturnUrl,
        oauthStateCookieValue: oauthState.nextCookieValue,
      });
    }

    return redirectToAuthError(request, {
      provider,
      reason: authErrorCodes.serverError,
      nextPath: oauthState.matchedEntry.nextPath,
      mobileReturnUrl: oauthState.matchedEntry.mobileReturnUrl,
      oauthStateCookieValue: oauthState.nextCookieValue,
    });
  }
}
