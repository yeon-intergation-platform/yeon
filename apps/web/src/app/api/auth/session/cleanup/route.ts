import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createYeonUrl } from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  AUTH_SESSION_COOKIE_NAME,
  getAppOrigin,
  normalizeAuthRedirectPath,
} from "@/server/auth/constants";
import { clearAuthSessionCookie } from "@/server/auth/session";
import { deleteRootAuthSessionInSpring } from "@/server/auth-session-spring-client";

export async function GET(request: NextRequest) {
  const sessionTokens = Array.from(
    new Set(
      request.cookies
        .getAll(AUTH_SESSION_COOKIE_NAME)
        .map((cookie) => cookie.value.trim())
        .filter(Boolean)
    )
  );

  await Promise.all(
    sessionTokens.map((sessionToken) =>
      deleteRootAuthSessionInSpring(sessionToken)
    )
  );

  const nextPath = normalizeAuthRedirectPath(
    request.nextUrl.searchParams.get("next") ?? "/"
  );
  const response = NextResponse.redirect(
    createYeonUrl(nextPath, getAppOrigin(request.nextUrl.origin)),
    { status: 303 }
  );

  clearAuthSessionCookie(response);

  return response;
}
