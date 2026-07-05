import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE_NAME } from "@/server/auth/constants";
import {
  clearAuthSessionCookie,
  getAuthUserBySessionToken,
} from "@/server/auth/session";
import { createErrorResponseBody } from "@/server/bff-error";

export function jsonUserRouteError(message: string, status: number) {
  return NextResponse.json(createErrorResponseBody(message, status), {
    status,
  });
}

export async function requireUsersRouteUser(request: NextRequest) {
  const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;
  const currentUser = sessionToken
    ? await getAuthUserBySessionToken(sessionToken)
    : null;

  if (currentUser) {
    return { currentUser, response: null };
  }

  const response = jsonUserRouteError("로그인이 필요합니다.", 401);
  if (sessionToken) {
    clearAuthSessionCookie(response);
  }

  return { currentUser: null, response };
}
