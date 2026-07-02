import {
  createUserBodySchema,
  createUserResponseSchema,
  listUsersResponseSchema,
} from "@yeon/api-contract/users";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE_NAME } from "@/server/auth/constants";
import {
  clearAuthSessionCookie,
  getAuthUserBySessionToken,
} from "@/server/auth/session";
import {
  createUserInSpring,
  fetchUsersFromSpring,
  UsersSpringBackendHttpError,
} from "@/server/users-spring-client";
import { createErrorResponseBody } from "@/server/bff-error";

function jsonError(message: string, status: number) {
  return NextResponse.json(createErrorResponseBody(message, status), {
    status,
  });
}

function getAuthenticatedUserFromRequest(request: NextRequest) {
  const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;

  return {
    sessionToken,
    userPromise: sessionToken ? getAuthUserBySessionToken(sessionToken) : null,
  };
}

export async function GET(request: NextRequest) {
  const { sessionToken, userPromise } =
    getAuthenticatedUserFromRequest(request);
  const currentUser = await userPromise;

  if (!currentUser) {
    const response = jsonError("로그인이 필요합니다.", 401);

    if (sessionToken) {
      clearAuthSessionCookie(response);
    }

    return response;
  }

  try {
    const users = await fetchUsersFromSpring(currentUser.id);

    return NextResponse.json(listUsersResponseSchema.parse(users));
  } catch (error) {
    if (error instanceof UsersSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }

    console.error(error);
    return jsonError("사용자 목록을 불러오지 못했습니다.", 500);
  }
}

export async function POST(request: NextRequest) {
  const { sessionToken, userPromise } =
    getAuthenticatedUserFromRequest(request);
  const currentUser = await userPromise;

  if (!currentUser) {
    const response = jsonError("로그인이 필요합니다.", 401);

    if (sessionToken) {
      clearAuthSessionCookie(response);
    }

    return response;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문 JSON 형식이 올바르지 않습니다.", 400);
  }

  const parseResult = createUserBodySchema.safeParse(body);

  if (!parseResult.success) {
    return jsonError("사용자 생성 요청 값이 올바르지 않습니다.", 400);
  }

  try {
    const result = await createUserInSpring(currentUser.id, parseResult.data);

    return NextResponse.json(createUserResponseSchema.parse(result), {
      status: 201,
    });
  } catch (error) {
    if (error instanceof UsersSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }

    console.error(error);
    return jsonError("사용자를 생성하지 못했습니다.", 500);
  }
}
