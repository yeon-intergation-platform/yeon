import { authSessionResponseSchema } from "@yeon/api-contract/auth";
import { errorResponseSchema } from "@yeon/api-contract/error";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getAuthSessionTokenFromRequest } from "@/server/auth/request-session-token";
import { clearAuthSessionCookie } from "@/server/auth/session";
import {
  deleteRootAuthSessionInSpring,
  fetchRootAuthSessionFromSpring,
} from "@/server/auth-session-spring-client";

function jsonError(message: string, status: number) {
  return NextResponse.json(errorResponseSchema.parse({ message }), { status });
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getAuthSessionTokenFromRequest(request);
    const session = sessionToken
      ? await fetchRootAuthSessionFromSpring(sessionToken.token)
      : authSessionResponseSchema.parse({ authenticated: false, user: null });
    const response = NextResponse.json(
      authSessionResponseSchema.parse(session),
      {
        headers: {
          "cache-control": "no-store",
        },
      }
    );

    if (sessionToken?.source === "cookie" && !session.authenticated) {
      clearAuthSessionCookie(response);
    }

    return response;
  } catch (error) {
    console.error(error);
    return jsonError("현재 로그인 상태를 불러오지 못했습니다.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = getAuthSessionTokenFromRequest(request);

    if (sessionToken) {
      await deleteRootAuthSessionInSpring(sessionToken.token);
    }

    const response = NextResponse.json(
      authSessionResponseSchema.parse({
        authenticated: false,
        user: null,
      }),
      {
        headers: {
          "cache-control": "no-store",
        },
      }
    );

    clearAuthSessionCookie(response);

    return response;
  } catch (error) {
    console.error(error);
    return jsonError("로그아웃을 처리하지 못했습니다.", 500);
  }
}
