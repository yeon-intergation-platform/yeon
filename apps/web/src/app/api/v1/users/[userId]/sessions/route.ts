import { invalidateUserSessionsResponseSchema } from "@yeon/api-contract/users";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  invalidateUserSessionsInSpring,
  UsersSpringBackendHttpError,
} from "@/server/users-spring-client";
import {
  jsonUserRouteError,
  requireUsersRouteUser,
} from "../../user-route-utils";

type UserSessionsRouteParams = {
  userId: string;
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<UserSessionsRouteParams> }
) {
  const { currentUser, response } = await requireUsersRouteUser(request);
  if (response) return response;

  const { userId } = await params;
  try {
    const result = await invalidateUserSessionsInSpring(currentUser.id, userId);
    return NextResponse.json(
      invalidateUserSessionsResponseSchema.parse(result)
    );
  } catch (error) {
    if (error instanceof UsersSpringBackendHttpError) {
      return jsonUserRouteError(error.message, error.status);
    }

    console.error(error);
    return jsonUserRouteError("사용자 세션을 정리하지 못했습니다.", 500);
  }
}
