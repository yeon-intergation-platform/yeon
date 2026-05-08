import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  MemberTabsSpringBackendHttpError,
  resetMemberTabsInSpring,
} from "@/server/member-tabs-spring-client";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { spaceId } = await params;

  try {
    const result = await resetMemberTabsInSpring(spaceId, currentUser.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MemberTabsSpringBackendHttpError)
      return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("초기화에 실패했습니다.", 500);
  }
}
