import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { analyzeRecordResponseSchema } from "@yeon/api-contract/counseling-records";
import {
  analyzeCounselingRecordFromSpring,
  CounselingRecordChatSpringBackendHttpError,
} from "@/server/counseling-record-chat-spring-client";

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
    const result = await analyzeCounselingRecordFromSpring(
      currentUser.id,
      recordId
    );

    return NextResponse.json(analyzeRecordResponseSchema.parse(result));
  } catch (error) {
    if (error instanceof CounselingRecordChatSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }

    console.error("counseling-record-analyze-error", error);
    return jsonError("AI 분석에 실패했습니다.", 500);
  }
}
