import type { AuthUserDto } from "@yeon/api-contract/auth";
import { getYeonRequestCookies } from "@yeon/ui/runtime/YeonServerRequest";
import type { NextResponse } from "next/server";
import {
  AUTH_SESSION_COOKIE_NAME,
  getAuthCookieDomain,
  isSecureAuthCookie,
} from "@/server/auth/constants";
import {
  deleteRootAuthSessionInSpring,
  fetchRootAuthSessionFromSpring,
} from "@/server/auth-session-spring-client";
import { createRootAuthSessionInSpring } from "@/server/root-auth-spring-client";

export async function createAuthSession(userId: string) {
  return createRootAuthSessionInSpring(userId);
}

export function applyAuthSessionCookie(
  response: NextResponse,
  session: {
    sessionToken: string;
    expiresAt: Date;
  }
) {
  const domain = getAuthCookieDomain();
  response.cookies.set({
    name: AUTH_SESSION_COOKIE_NAME,
    value: session.sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureAuthCookie(),
    path: "/",
    expires: session.expiresAt,
    ...(domain ? { domain } : {}),
  });

  return response;
}

function appendExpiredAuthCookie(response: NextResponse, domain?: string) {
  const parts = [
    `${AUTH_SESSION_COOKIE_NAME}=`,
    "Path=/",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (isSecureAuthCookie()) {
    parts.push("Secure");
  }
  if (domain) {
    parts.push(`Domain=${domain}`);
  }

  response.headers.append("set-cookie", parts.join("; "));
}

export function clearAuthSessionCookie(response: NextResponse) {
  appendExpiredAuthCookie(response);

  const domain = getAuthCookieDomain();
  if (domain) {
    appendExpiredAuthCookie(response, domain);
  }

  return response;
}

function uniqueTokens(tokens: string[]) {
  return Array.from(
    new Set(tokens.map((token) => token.trim()).filter(Boolean))
  );
}

async function getCurrentSessionTokens() {
  const cookieStore = await getYeonRequestCookies();

  return uniqueTokens(
    cookieStore.getAll(AUTH_SESSION_COOKIE_NAME).map((cookie) => cookie.value)
  );
}

export async function getAuthUserBySessionToken(
  sessionToken: string
): Promise<AuthUserDto | null> {
  const session = await fetchRootAuthSessionFromSpring(sessionToken);

  return session.authenticated ? session.user : null;
}

export async function getCurrentAuthUser() {
  const sessionTokens = await getCurrentSessionTokens();

  for (const sessionToken of sessionTokens) {
    const user = await getAuthUserBySessionToken(sessionToken);
    if (user) {
      return user;
    }
  }

  return null;
}

export async function deleteAuthSessionByToken(sessionToken: string) {
  await deleteRootAuthSessionInSpring(sessionToken);
}

export async function deleteCurrentAuthSession() {
  const sessionTokens = await getCurrentSessionTokens();

  await Promise.all(
    sessionTokens.map((sessionToken) => deleteAuthSessionByToken(sessionToken))
  );
}
