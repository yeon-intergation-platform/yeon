import {
  credentialLoginResponseSchema,
  mobileCredentialLoginResponseSchema,
  type CredentialLoginBody,
  type CredentialLoginResponse,
  type MobileCredentialLoginResponse,
} from "@yeon/api-contract/credential";

import {
  AuthFlowError,
  authErrorCodes,
  isAuthErrorCode,
} from "@/server/auth/auth-errors";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";

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

type LoginParams = CredentialLoginBody & {
  ipAddress: string;
};

async function loginWithCredentialInSpring(
  params: LoginParams
): Promise<MobileCredentialLoginResponse> {
  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/auth/credentials/login`,
    {
      method: "POST",
      cache: "no-store",
      headers: buildSpringBffHeaders({ "content-type": "application/json" }),
      body: JSON.stringify(params),
    }
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    const error = extractError(parsed);
    throw new AuthFlowError(error.code, error.message);
  }

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
