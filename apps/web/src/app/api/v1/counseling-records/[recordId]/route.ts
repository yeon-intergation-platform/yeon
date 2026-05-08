import {
  counselingRecordDetailResponseSchema,
  linkMemberRequestSchema,
  linkMemberResponseSchema,
} from "@yeon/api-contract/counseling-records";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  CounselingRecordDetailsSpringBackendHttpError,
  fetchCounselingRecordDetailFromSpring,
} from "@/server/counseling-record-details-spring-client";
import {
  CounselingRecordMutationSpringBackendHttpError,
  deleteCounselingRecordInSpring,
  linkCounselingRecordMemberInSpring,
} from "@/server/counseling-record-mutation-spring-client";

import { jsonError, requireAuthenticatedUser } from "../_shared";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    recordId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { currentUser, response } = await requireAuthenticatedUser(request);

  if (!currentUser) {
    return response;
  }

  const { recordId } = await context.params;

  try {
    const springResponse = await fetchCounselingRecordDetailFromSpring(
      currentUser.id,
      recordId,
    );

    return NextResponse.json(
      counselingRecordDetailResponseSchema.parse(springResponse),
    );
  } catch (error) {
    if (error instanceof CounselingRecordDetailsSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }

    console.error(error);
    return jsonError("상담 기록 상세를 불러오지 못했습니다.", 500);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { currentUser, response } = await requireAuthenticatedUser(request);

  if (!currentUser) {
    return response;
  }

  const { recordId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바르지 않습니다.", 400);
  }

  const parsed = linkMemberRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("memberId 형식이 올바르지 않습니다.", 400);
  }

  try {
    await linkCounselingRecordMemberInSpring(
      currentUser.id,
      recordId,
      parsed.data.memberId,
    );

    return NextResponse.json(linkMemberResponseSchema.parse({ ok: true }));
  } catch (error) {
    if (error instanceof CounselingRecordMutationSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }

    console.error(error);
    return jsonError("수강생 연결에 실패했습니다.", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { currentUser, response } = await requireAuthenticatedUser(request);

  if (!currentUser) {
    return response;
  }

  const { recordId } = await context.params;

  try {
    await deleteCounselingRecordInSpring(currentUser.id, recordId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof CounselingRecordMutationSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }

    console.error(error);
    return jsonError("상담 기록을 삭제하지 못했습니다.", 500);
  }
}
