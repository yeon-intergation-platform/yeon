import {
  authSessionResponseSchema,
  type AuthSessionResponse,
} from "@yeon/api-contract/auth";

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

export class AuthSessionSpringBackendHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthSessionSpringBackendHttpError";
    this.status = status;
  }
}

function tryParseJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function extractErrorMessage(parsed: unknown) {
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  if ("message" in parsed && typeof parsed.message === "string") {
    return parsed.message;
  }
  if (
    "error" in parsed &&
    parsed.error &&
    typeof parsed.error === "object" &&
    "message" in parsed.error &&
    typeof parsed.error.message === "string"
  ) {
    return parsed.error.message;
  }

  return null;
}

async function fetchAuthSession(
  sessionToken: string,
  init?: RequestInit
): Promise<AuthSessionResponse> {
  const headers = buildSpringBffHeaders(init?.headers);
  headers.set(SESSION_TOKEN_HEADER, sessionToken);

  const response = await fetch(
    `${resolveSpringBackendBaseUrl()}/auth/session`,
    {
      ...init,
      cache: "no-store",
      headers,
    }
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    throw new AuthSessionSpringBackendHttpError(
      response.status,
      extractErrorMessage(parsed) ?? "Spring 인증 세션 요청에 실패했습니다."
    );
  }

  return authSessionResponseSchema.parse(parsed);
}

export async function fetchRootAuthSessionFromSpring(sessionToken: string) {
  return fetchAuthSession(sessionToken);
}

export async function deleteRootAuthSessionInSpring(sessionToken: string) {
  return fetchAuthSession(sessionToken, { method: "DELETE" });
}
