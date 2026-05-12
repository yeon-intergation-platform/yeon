import { AuthFlowError, authErrorCodes } from "./auth-errors";
import {
  getAppOrigin,
  socialProviders,
  type SocialProvider,
} from "./constants";

function getRequiredEnv(name: string, provider: SocialProvider) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new AuthFlowError(
      authErrorCodes.providerNotConfigured,
      `${provider} 로그인 환경변수 ${name}이 필요합니다.`
    );
  }

  return value;
}

function getProviderCallbackUrl(
  provider: SocialProvider,
  originFallback?: string
) {
  return new URL(
    `/api/auth/${provider}/callback`,
    getAppOrigin(originFallback)
  ).toString();
}

function buildGoogleAuthorizationUrl(
  state: string,
  codeChallenge: string,
  originFallback?: string
) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  url.searchParams.set(
    "client_id",
    getRequiredEnv("GOOGLE_CLIENT_ID", socialProviders.google)
  );
  url.searchParams.set(
    "redirect_uri",
    getProviderCallbackUrl(socialProviders.google, originFallback)
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  return url.toString();
}

function buildKakaoAuthorizationUrl(
  state: string,
  codeChallenge: string,
  originFallback?: string
) {
  const url = new URL("https://kauth.kakao.com/oauth/authorize");

  url.searchParams.set(
    "client_id",
    getRequiredEnv("KAKAO_REST_API_KEY", socialProviders.kakao)
  );
  url.searchParams.set(
    "redirect_uri",
    getProviderCallbackUrl(socialProviders.kakao, originFallback)
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "account_email");
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  return url.toString();
}

export function buildSocialAuthorizationUrl(options: {
  provider: SocialProvider;
  state: string;
  codeChallenge: string;
  originFallback?: string;
}) {
  switch (options.provider) {
    case socialProviders.google:
      return buildGoogleAuthorizationUrl(
        options.state,
        options.codeChallenge,
        options.originFallback
      );
    case socialProviders.kakao:
      return buildKakaoAuthorizationUrl(
        options.state,
        options.codeChallenge,
        options.originFallback
      );
  }
}
