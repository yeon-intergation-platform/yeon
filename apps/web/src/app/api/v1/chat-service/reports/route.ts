import {
  chatServiceCreateReportBodySchema,
  chatServiceCreateReportResponseSchema,
} from "@yeon/api-contract/chat-service";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ChatServiceReportSpringBackendHttpError,
  createChatServiceReportInSpring,
} from "@/server/chat-service-report-spring-client";
import { ServiceError } from "@/server/errors/service-error";
import {
  jsonChatServiceError,
  parseJsonBody,
  requireChatServiceAuth,
} from "@/app/api/v1/chat-service/_shared";

export async function POST(request: NextRequest) {
  try {
    const { profile } = await requireChatServiceAuth(request);
    const body = await parseJsonBody(request);
    const parsedBody = chatServiceCreateReportBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonChatServiceError("신고 요청값이 올바르지 않습니다.", 400);
    }

    const response = await createChatServiceReportInSpring({
      currentProfileId: profile.id,
      targetType: parsedBody.data.targetType,
      targetId: parsedBody.data.targetId,
      reason: parsedBody.data.reason,
    });

    return NextResponse.json(
      chatServiceCreateReportResponseSchema.parse(response),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status, error.detail);
    }
    if (error instanceof ChatServiceReportSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status, {
        code: error.code,
      });
    }

    console.error(error);
    return jsonChatServiceError("신고를 접수하지 못했습니다.", 500);
  }
}
