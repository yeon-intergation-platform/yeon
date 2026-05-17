import type { AuthUserDto } from "@yeon/api-contract/auth";
import { cookies } from "next/headers";
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

export function clearAuthSessionCookie(response: NextResponse) {
  const domain = getAuthCookieDomain();
  response.cookies.set({
    name: AUTH_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureAuthCookie(),
    path: "/",
    expires: new Date(0),
    ...(domain ? { domain } : {}),
  });

  return response;
}

async function getCurrentSessionToken() {
  const cookieStore = await cookies();

  return cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getAuthUserBySessionToken(
  sessionToken: string
): Promise<AuthUserDto | null> {
  const session = await fetchRootAuthSessionFromSpring(sessionToken);

  return session.authenticated ? session.user : null;
}

export async function getCurrentAuthUser() {
  const sessionToken = await getCurrentSessionToken();

  if (!sessionToken) {
    return null;
  }

  return getAuthUserBySessionToken(sessionToken);
}

export async function deleteAuthSessionByToken(sessionToken: string) {
  await deleteRootAuthSessionInSpring(sessionToken);
}

export async function deleteCurrentAuthSession() {
  const sessionToken = await getCurrentSessionToken();

  if (!sessionToken) {
    return;
  }

  await deleteAuthSessionByToken(sessionToken);
}
