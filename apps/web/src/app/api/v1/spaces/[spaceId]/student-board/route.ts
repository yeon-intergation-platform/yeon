import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  createPublicCheckSessionBodySchema,
  studentBoardHistoryPeriodSchema,
  studentBoardResponseSchema,
} from "@yeon/api-contract";

import {
  jsonError,
  requireAuthenticatedUser,
  withHandler,
} from "@/app/api/v1/counseling-records/_shared";
import { createPublicCheckSessionInSpring, PublicCheckSessionsSpringBackendHttpError } from "@/server/public-check-sessions-spring-client";
import {
  fetchStudentBoardFromSpring,
  StudentBoardSpringBackendHttpError,
} from "@/server/student-board-spring-client";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ spaceId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  return withHandler(async () => {
    const { currentUser, response } = await requireAuthenticatedUser(request);

    if (!currentUser) {
      return response as Response;
    }

    const { spaceId } = await context.params;
    const periodResult = studentBoardHistoryPeriodSchema.safeParse(
      request.nextUrl.searchParams.get("historyPeriod") ?? "7d",
    );

    if (!periodResult.success) {
      return jsonError("보드 이력 기간 값이 올바르지 않습니다.", 400);
    }

    try {
      const data = await fetchStudentBoardFromSpring(
        spaceId,
        currentUser.id,
        periodResult.data,
      );

      return NextResponse.json(studentBoardResponseSchema.parse(data));
    } catch (error) {
      if (error instanceof StudentBoardSpringBackendHttpError) {
        return jsonError(error.message, error.status);
      }

      console.error(error);
      return jsonError("학생 보드를 불러오지 못했습니다.", 500);
    }
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { currentUser, response } = await requireAuthenticatedUser(request);

  if (!currentUser) {
    return response;
  }

  const { spaceId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = createPublicCheckSessionBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("체크인 세션 생성 요청 값이 올바르지 않습니다.", 400);
  }

  try {
    const { session } = await createPublicCheckSessionInSpring(
      spaceId,
      currentUser.id,
      parsed.data,
    );

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    if (error instanceof PublicCheckSessionsSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }

    console.error(error);
    return jsonError("체크인 세션을 생성하지 못했습니다.", 500);
  }
}
