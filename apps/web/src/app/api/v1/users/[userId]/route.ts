import {
  deleteUserResponseSchema,
  updateUserBodySchema,
  updateUserResponseSchema,
} from "@yeon/api-contract/users";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  deleteUserInSpring,
  updateUserInSpring,
  UsersSpringBackendHttpError,
} from "@/server/users-spring-client";
import { jsonUserRouteError, requireUsersRouteUser } from "../user-route-utils";

type UserRouteParams = {
  userId: string;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<UserRouteParams> }
) {
  const { currentUser, response } = await requireUsersRouteUser(request);
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonUserRouteError("요청 본문 JSON 형식이 올바르지 않습니다.", 400);
  }

  const parsedBody = updateUserBodySchema.safeParse(body);
  if (!parsedBody.success) {
    return jsonUserRouteError("사용자 수정 요청 값이 올바르지 않습니다.", 400);
  }

  const { userId } = await params;
  try {
    const result = await updateUserInSpring(
      currentUser.id,
      userId,
      parsedBody.data
    );
    return NextResponse.json(updateUserResponseSchema.parse(result));
  } catch (error) {
    if (error instanceof UsersSpringBackendHttpError) {
      return jsonUserRouteError(error.message, error.status);
    }

    console.error(error);
    return jsonUserRouteError("사용자를 수정하지 못했습니다.", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<UserRouteParams> }
) {
  const { currentUser, response } = await requireUsersRouteUser(request);
  if (response) return response;

  const { userId } = await params;
  try {
    const result = await deleteUserInSpring(currentUser.id, userId);
    return NextResponse.json(deleteUserResponseSchema.parse(result));
  } catch (error) {
    if (error instanceof UsersSpringBackendHttpError) {
      return jsonUserRouteError(error.message, error.status);
    }

    console.error(error);
    return jsonUserRouteError("사용자를 삭제하지 못했습니다.", 500);
  }
}
