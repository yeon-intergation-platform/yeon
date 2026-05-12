import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  AUTH_SESSION_COOKIE_NAME,
  getAppOrigin,
} from "@/server/auth/constants";
import { clearAuthSessionCookie } from "@/server/auth/session";
import { deleteRootAuthSessionInSpring } from "@/server/auth-session-spring-client";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await deleteRootAuthSessionInSpring(sessionToken);
  }

  const response = NextResponse.redirect(
    new URL("/", getAppOrigin(request.nextUrl.origin)),
    { status: 303 }
  );

  clearAuthSessionCookie(response);

  return response;
}
