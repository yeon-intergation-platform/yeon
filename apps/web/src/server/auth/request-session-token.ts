import type { NextRequest } from "next/server";

import { AUTH_SESSION_COOKIE_NAME } from "./constants";

export type AuthSessionTokenSource = "authorization" | "cookie";

export type AuthSessionTokenFromRequest = {
  source: AuthSessionTokenSource;
  token: string;
} | null;

export type AuthSessionTokenCandidate = NonNullable<AuthSessionTokenFromRequest>;

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const [scheme, token] = authorization?.split(/\s+/, 2) ?? [];

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

function uniqueTokens(tokens: string[]) {
  return Array.from(
    new Set(tokens.map((token) => token.trim()).filter(Boolean)),
  );
}

function getCookieSessionTokens(request: NextRequest) {
  const rawCookie = request.headers.get("cookie");

  if (!rawCookie) {
    return [];
  }

  return uniqueTokens(
    rawCookie
      .split(";")
      .map((part) => part.trim())
      .filter((part) => part.startsWith(`${AUTH_SESSION_COOKIE_NAME}=`))
      .map((part) => part.slice(AUTH_SESSION_COOKIE_NAME.length + 1)),
  );
}

export function getAuthSessionTokensFromRequest(
  request: NextRequest,
): AuthSessionTokenCandidate[] {
  const bearerToken = getBearerToken(request);

  if (bearerToken) {
    return [
      {
        source: "authorization",
        token: bearerToken,
      },
    ];
  }

  return getCookieSessionTokens(request).map((token) => ({
    source: "cookie",
    token,
  }));
}

export function getAuthSessionTokenFromRequest(
  request: NextRequest,
): AuthSessionTokenFromRequest {
  return getAuthSessionTokensFromRequest(request)[0] ?? null;
}
