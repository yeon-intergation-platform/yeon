import {
  deleteUserResponseSchema,
  withdrawUserBodySchema,
} from "@yeon/api-contract/users";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clearAuthSessionCookie } from "@/server/auth/session";
import {
  UsersSpringBackendHttpError,
  withdrawCurrentUserInSpring,
} from "@/server/users-spring-client";
import { jsonUserRouteError, requireUsersRouteUser } from "../user-route-utils";

const WITHDRAW_CONFIRMATIONS = new Set(["회원탈퇴", "DELETE"]);

export async function DELETE(request: NextRequest) {
  const { currentUser, response } = await requireUsersRouteUser(request);
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonUserRouteError("요청 본문 JSON 형식이 올바르지 않습니다.", 400);
  }

  const parsedBody = withdrawUserBodySchema.safeParse(body);
  if (
    !parsedBody.success ||
    !WITHDRAW_CONFIRMATIONS.has(parsedBody.data.confirmation)
  ) {
    return jsonUserRouteError("회원탈퇴 확인 문구가 올바르지 않습니다.", 400);
  }

  try {
    const result = await withdrawCurrentUserInSpring(currentUser.id);
    const nextResponse = NextResponse.json(
      deleteUserResponseSchema.parse(result)
    );
    clearAuthSessionCookie(nextResponse);
    return nextResponse;
  } catch (error) {
    if (error instanceof UsersSpringBackendHttpError) {
      return jsonUserRouteError(error.message, error.status);
    }

    console.error(error);
    return jsonUserRouteError("회원탈퇴를 처리하지 못했습니다.", 500);
  }
}
