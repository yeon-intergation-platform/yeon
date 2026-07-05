import {
  updateUserResponseSchema,
  updateUserRoleBodySchema,
} from "@yeon/api-contract/users";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  updateUserRoleInSpring,
  UsersSpringBackendHttpError,
} from "@/server/users-spring-client";
import {
  jsonUserRouteError,
  requireUsersRouteUser,
} from "../../user-route-utils";

type UserRoleRouteParams = {
  userId: string;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<UserRoleRouteParams> }
) {
  const { currentUser, response } = await requireUsersRouteUser(request);
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonUserRouteError("요청 본문 JSON 형식이 올바르지 않습니다.", 400);
  }

  const parsedBody = updateUserRoleBodySchema.safeParse(body);
  if (!parsedBody.success) {
    return jsonUserRouteError("역할 변경 요청 값이 올바르지 않습니다.", 400);
  }

  const { userId } = await params;
  try {
    const result = await updateUserRoleInSpring(
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
    return jsonUserRouteError("사용자 역할을 변경하지 못했습니다.", 500);
  }
}
