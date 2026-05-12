import { z } from "zod";
import type { NextRequest } from "next/server";

import {
  CounselingRecordTrendSpringBackendHttpError,
  streamCounselingRecordTrendAnalysisFromSpring,
} from "@/server/counseling-record-trend-spring-client";

import { jsonError, requireAuthenticatedUser } from "../_shared";

export const runtime = "nodejs";

const analyzeTrendBodySchema = z.object({
  recordIds: z.array(z.string()).min(1, "recordIds는 비어 있을 수 없습니다."),
});

export async function POST(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);

  if (!currentUser) {
    return response;
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonError("요청 본문 형식이 올바르지 않습니다.", 400);
  }

  const parsed = analyzeTrendBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "잘못된 요청입니다.",
      400
    );
  }

  try {
    const stream = await streamCounselingRecordTrendAnalysisFromSpring(
      currentUser.id,
      parsed.data
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof CounselingRecordTrendSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }

    console.error("counseling-trend-analysis-bridge-error", error);
    return jsonError("추이 분석 요청을 처리하지 못했습니다.", 500);
  }
}
