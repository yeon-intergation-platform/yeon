import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { bulkUpsertMemberFieldValuesBodySchema } from "@yeon/api-contract/spaces";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  bulkUpsertMemberFieldValuesInSpring,
  fetchMemberFieldValuesFromSpring,
  MemberFieldValuesSpringBackendHttpError,
} from "@/server/member-field-values-spring-client";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string; memberId: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { spaceId, memberId } = await params;
  const fieldDefinitionIds = request.nextUrl.searchParams
    .getAll("fieldDefinitionId")
    .filter(Boolean);

  try {
    const result = await fetchMemberFieldValuesFromSpring(
      spaceId,
      memberId,
      currentUser.id,
      fieldDefinitionIds,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MemberFieldValuesSpringBackendHttpError)
      return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("필드 값을 불러오지 못했습니다.", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string; memberId: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { spaceId, memberId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = bulkUpsertMemberFieldValuesBodySchema.safeParse(body);
  if (!parsed.success)
    return jsonError("요청 데이터가 올바르지 않습니다.", 400);

  try {
    const result = await bulkUpsertMemberFieldValuesInSpring(
      spaceId,
      memberId,
      currentUser.id,
      parsed.data,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MemberFieldValuesSpringBackendHttpError)
      return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("필드 값을 저장하지 못했습니다.", 500);
  }
}
