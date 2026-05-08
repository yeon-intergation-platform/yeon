import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createMemberFieldBodySchema } from "@yeon/api-contract/spaces";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  bootstrapOverviewFieldsInSpring,
  createMemberFieldInSpring,
  fetchMemberFieldsFromSpring,
  fetchMemberFieldValuesFromSpring,
  MemberFieldsSpringBackendHttpError,
} from "@/server/member-fields-spring-client";

export const runtime = "nodejs";

async function maybeBootstrapOverviewFields(
  spaceId: string,
  tabId: string,
  userId: string,
) {
  await bootstrapOverviewFieldsInSpring(spaceId, tabId, userId).catch((error) => {
    if (
      error instanceof MemberFieldsSpringBackendHttpError &&
      error.message === "개요 탭에서만 기본 필드 초기화를 수행할 수 있습니다."
    ) {
      return null;
    }
    throw error;
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string; tabId: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { spaceId, tabId } = await params;
  const memberId = request.nextUrl.searchParams.get("memberId");

  try {
    await maybeBootstrapOverviewFields(spaceId, tabId, currentUser.id);

    if (!memberId) {
      const result = await fetchMemberFieldsFromSpring(spaceId, tabId, currentUser.id);
      return NextResponse.json(result);
    }

    const [fieldsResult, valuesResult] = await Promise.all([
      fetchMemberFieldsFromSpring(spaceId, tabId, currentUser.id),
      fetchMemberFieldValuesFromSpring(spaceId, tabId, memberId, currentUser.id),
    ]);

    return NextResponse.json({ fields: fieldsResult.fields, values: valuesResult.values });
  } catch (error) {
    if (error instanceof MemberFieldsSpringBackendHttpError)
      return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("필드 목록을 불러오지 못했습니다.", 500);
  }
}

export async function POST(
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

  const parsed = createMemberFieldBodySchema.safeParse(body);
  if (!parsed.success)
    return jsonError("요청 데이터가 올바르지 않습니다.", 400);

  try {
    await maybeBootstrapOverviewFields(spaceId, tabId, currentUser.id);

    const result = await createMemberFieldInSpring(
      spaceId,
      tabId,
      currentUser.id,
      parsed.data,
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof MemberFieldsSpringBackendHttpError)
      return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("필드를 생성하지 못했습니다.", 500);
  }
}
