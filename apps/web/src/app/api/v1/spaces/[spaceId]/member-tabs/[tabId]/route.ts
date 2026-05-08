import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateMemberTabBodySchema } from "@yeon/api-contract/spaces";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  deleteMemberTabInSpring,
  MemberTabsSpringBackendHttpError,
  updateMemberTabInSpring,
} from "@/server/member-tabs-spring-client";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string; tabId: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { spaceId, tabId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = updateMemberTabBodySchema.safeParse(body);
  if (!parsed.success)
    return jsonError("요청 데이터가 올바르지 않습니다.", 400);

  try {
    const result = await updateMemberTabInSpring(
      spaceId,
      tabId,
      currentUser.id,
      parsed.data,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MemberTabsSpringBackendHttpError)
      return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("탭을 수정하지 못했습니다.", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string; tabId: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { spaceId, tabId } = await params;

  try {
    await deleteMemberTabInSpring(spaceId, tabId, currentUser.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof MemberTabsSpringBackendHttpError)
      return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("탭을 삭제하지 못했습니다.", 500);
  }
}
