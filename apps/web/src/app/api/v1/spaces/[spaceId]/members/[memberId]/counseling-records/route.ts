import { listCounselingRecordsResponseSchema } from "@yeon/api-contract/counseling-records";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { jsonError, requireAuthenticatedUser } from "@/app/api/v1/counseling-records/_shared";
import { fetchMemberInSpaceFromSpring, MembersSpringBackendHttpError } from "@/server/members-spring-client";
import { fetchMemberCounselingRecordsFromSpring, MemberCounselingRecordsSpringBackendHttpError } from "@/server/member-counseling-records-spring-client";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ spaceId: string; memberId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { spaceId, memberId } = await context.params;
  const rawLimit = request.nextUrl.searchParams.get("limit");
  const rawBefore = request.nextUrl.searchParams.get("before");

  try {
    const limit = rawLimit ? Number(rawLimit) : undefined;
    if (limit !== undefined && (!Number.isInteger(limit) || limit <= 0 || limit > 500)) {
      return jsonError("limit은 1 이상 500 이하의 정수여야 합니다.", 400);
    }
    const beforeCreatedAt = rawBefore ? new Date(rawBefore) : undefined;
    if (beforeCreatedAt && Number.isNaN(beforeCreatedAt.getTime())) {
      return jsonError("before 커서 형식이 올바르지 않습니다.", 400);
    }

    await fetchMemberInSpaceFromSpring(spaceId, memberId, currentUser.id);
    const payload = await fetchMemberCounselingRecordsFromSpring({
      userId: currentUser.id,
      spaceId,
      memberId,
      limit,
      before: rawBefore ?? undefined,
    });
    return NextResponse.json(listCounselingRecordsResponseSchema.parse(payload));
  } catch (error) {
    if (error instanceof MembersSpringBackendHttpError) return jsonError(error.message, error.status);
    if (error instanceof MemberCounselingRecordsSpringBackendHttpError) return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("수강생의 상담 기록을 불러오지 못했습니다.", 500);
  }
}
