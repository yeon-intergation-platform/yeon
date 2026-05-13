import { counselingRecordDetailResponseSchema } from "@yeon/api-contract/counseling-records";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ServiceError } from "@/server/errors/service-error";
import {
  CounselingRecordTranscriptionSpringBackendHttpError,
  retryCounselingRecordTranscriptionInSpring,
} from "@/server/counseling-record-transcription-spring-client";

import { jsonError, requireAuthenticatedUser } from "../../_shared";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    recordId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { currentUser, response } = await requireAuthenticatedUser(request);

  if (!currentUser) {
    return response;
  }

  const { recordId } = await context.params;

  try {
    const payload = await retryCounselingRecordTranscriptionInSpring({
      userId: currentUser.id,
      recordId,
      clientRequestId: request.headers.get("x-client-request-id"),
    });

    return NextResponse.json(
      counselingRecordDetailResponseSchema.parse(payload)
    );
  } catch (error) {
    if (error instanceof CounselingRecordTranscriptionSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }

    console.error(error);
    return jsonError("상담 음성 재전사를 처리하지 못했습니다.", 500);
  }
}
