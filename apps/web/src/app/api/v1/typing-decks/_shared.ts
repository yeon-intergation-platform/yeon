import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { ErrorResponseMeta } from "@yeon/api-contract/error";
import { createErrorResponseBody } from "@/server/bff-error";
import { getAuthSessionTokenFromRequest } from "@/server/auth/request-session-token";
import { getAuthUserBySessionToken } from "@/server/auth/session";
import { isAdminUser } from "@/server/auth/admin";
import { ServiceError } from "@/server/errors/service-error";

export function jsonError(
  message: string,
  status: number,
  detail?: ErrorResponseMeta
) {
  return NextResponse.json(createErrorResponseBody(message, status, detail), {
    status,
  });
}

export async function getOptionalAuthenticatedUser(request: NextRequest) {
  const sessionToken = getAuthSessionTokenFromRequest(request);
  const currentUser = sessionToken
    ? await getAuthUserBySessionToken(sessionToken.token)
    : null;

  return { currentUser };
}

export async function getTypingDeckRequestContext(request: NextRequest) {
  const { currentUser } = await getOptionalAuthenticatedUser(request);
  const requestedAdminMode = request.nextUrl.searchParams.get("admin") === "1";

  if (!requestedAdminMode) {
    return { currentUser, isAdmin: false };
  }

  if (!currentUser) {
    throw new ServiceError(401, "관리자 로그인이 필요합니다.");
  }

  if (!(await isAdminUser(currentUser))) {
    throw new ServiceError(403, "관리자 권한이 필요합니다.");
  }

  return { currentUser, isAdmin: true };
}

export async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new Error("INVALID_JSON");
  }
}
