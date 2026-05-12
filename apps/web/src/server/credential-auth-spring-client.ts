import {
  credentialLoginResponseSchema,
  credentialRegisterResponseSchema,
  mobileCredentialLoginResponseSchema,
  type CredentialLoginBody,
  type CredentialLoginResponse,
  type MobileCredentialLoginResponse,
  type CredentialRegisterBody,
  type CredentialRegisterResponse,
  type CredentialResetConfirmBody,
  type CredentialResetRequestBody,
  type CredentialResendVerificationBody,
  type CredentialSetPasswordBody,
} from "@yeon/api-contract/credential";

import {
  AuthFlowError,
  authErrorCodes,
  isAuthErrorCode,
} from "@/server/auth/auth-errors";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const SESSION_TOKEN_HEADER = "X-Yeon-Session-Token";

function resolveSpringBackendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ??
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();

  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

function tryParseJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function extractError(parsed: unknown) {
  if (!parsed || typeof parsed !== "object") {
    return {
      code: authErrorCodes.serverError,
      message: "Spring credential 인증 요청에 실패했습니다.",
    };
  }

  const code =
    "code" in parsed && typeof parsed.code === "string"
      ? parsed.code
      : authErrorCodes.serverError;
  const message =
    "message" in parsed && typeof parsed.message === "string"
      ? parsed.message
      : "Spring credential 인증 요청에 실패했습니다.";

  return {
    code: isAuthErrorCode(code) ? code : authErrorCodes.serverError,
    message,
  };
}

type SpringCredentialRequest = {
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
  sessionToken?: string;
};

async function requestCredentialSpring({
  path,
  method = "POST",
  body,
  sessionToken,
}: SpringCredentialRequest) {
  const headers = buildSpringBffHeaders({ "content-type": "application/json" });

  if (sessionToken) {
    headers.set(SESSION_TOKEN_HEADER, sessionToken);
  }

  const response = await fetch(`${resolveSpringBackendBaseUrl()}${path}`, {
    method,
    cache: "no-store",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const raw = await response.text();
  const parsed = raw.length > 0 ? tryParseJson(raw) : null;

  if (!response.ok) {
    const error = extractError(parsed);
    throw new AuthFlowError(error.code, error.message);
  }

  return parsed;
}

type LoginParams = CredentialLoginBody & {
  ipAddress: string;
};

async function loginWithCredentialInSpring(
  params: LoginParams
): Promise<MobileCredentialLoginResponse> {
  const parsed = await requestCredentialSpring({
    path: "/auth/credentials/login",
    body: params,
  });

  return mobileCredentialLoginResponseSchema.parse(parsed);
}

export async function loginCredentialWebInSpring(params: LoginParams): Promise<
  CredentialLoginResponse & {
    session: { sessionToken: string; expiresAt: Date };
  }
> {
  const result = await loginWithCredentialInSpring(params);
  const webResponse = credentialLoginResponseSchema.parse({
    userId: result.userId,
    expiresAt: result.expiresAt,
  });

  return {
    ...webResponse,
    session: {
      sessionToken: result.sessionToken,
      expiresAt: new Date(result.expiresAt),
    },
  };
}

export async function loginCredentialMobileInSpring(params: LoginParams) {
  return loginWithCredentialInSpring(params);
}

type AppOriginParams = {
  ipAddress: string;
  appOrigin: string;
};

export async function registerCredentialInSpring(
  params: CredentialRegisterBody & AppOriginParams
): Promise<CredentialRegisterResponse> {
  const parsed = await requestCredentialSpring({
    path: "/auth/credentials/register",
    body: params,
  });

  return credentialRegisterResponseSchema.parse(parsed);
}

export async function resendCredentialVerificationInSpring(
  params: CredentialResendVerificationBody & AppOriginParams
) {
  await requestCredentialSpring({
    path: "/auth/credentials/resend-verification",
    body: params,
  });
}

export async function verifyCredentialEmailInSpring(token: string) {
  await requestCredentialSpring({
    path: `/auth/credentials/verify?token=${encodeURIComponent(token)}`,
    method: "GET",
  });
}

export async function requestCredentialPasswordResetInSpring(
  params: CredentialResetRequestBody & AppOriginParams
) {
  await requestCredentialSpring({
    path: "/auth/credentials/reset-request",
    body: params,
  });
}

export async function confirmCredentialPasswordResetInSpring(
  params: CredentialResetConfirmBody
) {
  await requestCredentialSpring({
    path: "/auth/credentials/reset-confirm",
    body: params,
  });
}

export async function setCredentialPasswordInSpring(params: {
  sessionToken: string;
  body: CredentialSetPasswordBody;
}) {
  await requestCredentialSpring({
    path: "/auth/credentials/set-password",
    body: params.body,
    sessionToken: params.sessionToken,
  });
}
