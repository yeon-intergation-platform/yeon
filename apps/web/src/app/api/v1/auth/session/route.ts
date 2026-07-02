import { authSessionResponseSchema } from "@yeon/api-contract/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createErrorResponseBody } from "@/server/bff-error";
import { getAuthSessionTokensFromRequest } from "@/server/auth/request-session-token";
import { clearAuthSessionCookie } from "@/server/auth/session";
import {
  deleteRootAuthSessionInSpring,
  fetchRootAuthSessionFromSpring,
} from "@/server/auth-session-spring-client";

function jsonError(message: string, status: number) {
  return NextResponse.json(createErrorResponseBody(message, status), {
    status,
  });
}

export async function GET(request: NextRequest) {
  try {
    const sessionTokens = getAuthSessionTokensFromRequest(request);
    const sessions = await Promise.all(
      sessionTokens.map((sessionToken) =>
        fetchRootAuthSessionFromSpring(sessionToken.token)
      )
    );
    const session =
      sessions.find((candidate) => candidate.authenticated) ??
      authSessionResponseSchema.parse({ authenticated: false, user: null });
    const response = NextResponse.json(
      authSessionResponseSchema.parse(session),
      {
        headers: {
          "cache-control": "no-store",
        },
      }
    );

    if (
      sessionTokens.some((sessionToken) => sessionToken.source === "cookie") &&
      !session.authenticated
    ) {
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
    const sessionTokens = getAuthSessionTokensFromRequest(request);

    await Promise.all(
      sessionTokens.map((sessionToken) =>
        deleteRootAuthSessionInSpring(sessionToken.token)
      )
    );

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
