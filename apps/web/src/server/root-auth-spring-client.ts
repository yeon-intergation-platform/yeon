import {
  fetchYeon,
  type YeonRequestInit,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { z } from "zod";
import { devLoginOptionSchema } from "@/lib/auth/dev-login-options";
import type { SocialProvider } from "@/server/auth/constants";
import {
  AuthFlowError,
  authErrorCodes,
  isAuthErrorCode,
} from "@/server/auth/auth-errors";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";

const rootAuthSessionResponseSchema = z.object({
  userId: z.string().uuid(),
  sessionToken: z.string().min(1),
  expiresAt: z.string().datetime(),
});

const devLoginOptionsResponseSchema = z.object({
  options: z.array(devLoginOptionSchema),
});

const adminCheckResponseSchema = z.object({
  admin: z.boolean(),
});

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
      message: "Spring root 인증 요청에 실패했습니다.",
    };
  }

  const code =
    "code" in parsed && typeof parsed.code === "string"
      ? parsed.code
      : authErrorCodes.serverError;
  const message =
    "message" in parsed && typeof parsed.message === "string"
      ? parsed.message
      : "Spring root 인증 요청에 실패했습니다.";

  return {
    code: isAuthErrorCode(code) ? code : authErrorCodes.serverError,
    message,
  };
}

async function requestRootAuthSpring(path: string, init?: YeonRequestInit) {
  const response = await fetchYeon(`${resolveSpringBackendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: buildSpringBffHeaders(init?.headers),
  });

  const raw = await response.text();
  const parsed = raw.length > 0 ? tryParseJson(raw) : null;

  if (!response.ok) {
    const error = extractError(parsed);
    throw new AuthFlowError(error.code, error.message);
  }

  return parsed;
}

function toSession(parsed: unknown) {
  const result = rootAuthSessionResponseSchema.parse(parsed);

  return {
    userId: result.userId,
    sessionToken: result.sessionToken,
    expiresAt: new Date(result.expiresAt),
  };
}

export async function completeSocialAuthInSpring(params: {
  provider: SocialProvider;
  code: string;
  codeVerifier: string;
  appOrigin: string;
}) {
  const parsed = await requestRootAuthSpring("/auth/social/complete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
  });

  return toSession(parsed);
}

export async function createRootAuthSessionInSpring(userId: string) {
  const parsed = await requestRootAuthSpring("/auth/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  return toSession(parsed);
}

export async function listDevLoginOptionsInSpring() {
  const parsed = await requestRootAuthSpring("/auth/dev-login/options");

  return devLoginOptionsResponseSchema.parse(parsed).options;
}

export async function createDevLoginSessionInSpring(params: {
  accountKey: string | null;
  create: boolean;
}) {
  const parsed = await requestRootAuthSpring("/auth/dev-login/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
  });

  return toSession(parsed);
}

export async function checkAdminInSpring(params: {
  userId: string;
  email: string;
}) {
  const parsed = await requestRootAuthSpring("/auth/admin/check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
  });

  return adminCheckResponseSchema.parse(parsed).admin;
}
