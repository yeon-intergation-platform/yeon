import {
  createUserBodySchema,
  createUserResponseSchema,
  listUsersResponseSchema,
} from "@yeon/api-contract/users";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jsonUserRouteError, requireUsersRouteUser } from "./user-route-utils";
import {
  createUserInSpring,
  fetchUsersFromSpring,
  UsersSpringBackendHttpError,
} from "@/server/users-spring-client";

export async function GET(request: NextRequest) {
  const { currentUser, response } = await requireUsersRouteUser(request);

  if (response) {
    return response;
  }

  try {
    const users = await fetchUsersFromSpring(currentUser.id);

    return NextResponse.json(listUsersResponseSchema.parse(users));
  } catch (error) {
    if (error instanceof UsersSpringBackendHttpError) {
      return jsonUserRouteError(error.message, error.status);
    }

    console.error(error);
    return jsonUserRouteError("사용자 목록을 불러오지 못했습니다.", 500);
  }
}

export async function POST(request: NextRequest) {
  const { currentUser, response } = await requireUsersRouteUser(request);

  if (response) {
    return response;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonUserRouteError("요청 본문 JSON 형식이 올바르지 않습니다.", 400);
  }

  const parseResult = createUserBodySchema.safeParse(body);

  if (!parseResult.success) {
    return jsonUserRouteError("사용자 생성 요청 값이 올바르지 않습니다.", 400);
  }

  try {
    const result = await createUserInSpring(currentUser.id, parseResult.data);

    return NextResponse.json(createUserResponseSchema.parse(result), {
      status: 201,
    });
  } catch (error) {
    if (error instanceof UsersSpringBackendHttpError) {
      return jsonUserRouteError(error.message, error.status);
    }

    console.error(error);
    return jsonUserRouteError("사용자를 생성하지 못했습니다.", 500);
  }
}
