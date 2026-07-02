import type { AuthUserDto } from "@yeon/api-contract/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createErrorResponseBody } from "@/server/bff-error";
import { getAuthSessionTokensFromRequest } from "@/server/auth/request-session-token";
import {
  clearAuthSessionCookie,
  getAuthUserBySessionToken,
} from "@/server/auth/session";

const ADMIN_ARTICLE_ID_MAX_LENGTH = 80;

type AdminPublicContentAuthResult =
  | {
      currentUser: AuthUserDto;
      response: null;
    }
  | {
      currentUser: null;
      response: NextResponse;
    };

export function jsonAdminPublicContentError(message: string, status: number) {
  return NextResponse.json(createErrorResponseBody(message, status), {
    status,
  });
}

export async function requireAdminPublicContentAuthenticatedUser(
  request: NextRequest
): Promise<AdminPublicContentAuthResult> {
  const sessionTokens = getAuthSessionTokensFromRequest(request);

  for (const sessionToken of sessionTokens) {
    const currentUser = await getAuthUserBySessionToken(sessionToken.token);

    if (currentUser) {
      return {
        currentUser,
        response: null,
      };
    }
  }

  const response = jsonAdminPublicContentError("로그인이 필요합니다.", 401);

  if (sessionTokens.some((sessionToken) => sessionToken.source === "cookie")) {
    clearAuthSessionCookie(response);
  }

  return {
    currentUser: null,
    response,
  };
}

export function parseAdminPublicContentArticleId(rawArticleId: string) {
  const articleId = rawArticleId.trim();

  if (!articleId || articleId.length > ADMIN_ARTICLE_ID_MAX_LENGTH) {
    return null;
  }

  return articleId;
}
