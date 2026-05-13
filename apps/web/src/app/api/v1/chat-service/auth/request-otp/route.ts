import {
  chatServiceRequestOtpBodySchema,
  chatServiceRequestOtpResponseSchema,
} from "@yeon/api-contract/chat-service";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ChatServiceAuthSpringBackendHttpError,
  requestChatServiceOtpInSpring,
} from "@/server/chat-service-auth-spring-client";
import { ServiceError } from "@/server/errors/service-error";

import {
  jsonChatServiceError,
  parseJsonBody,
} from "@/app/api/v1/chat-service/_shared";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    const parsedBody = chatServiceRequestOtpBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonChatServiceError("전화번호 입력값이 올바르지 않습니다.", 400);
    }

    const response = await requestChatServiceOtpInSpring(parsedBody.data);

    return NextResponse.json(
      chatServiceRequestOtpResponseSchema.parse(response),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status);
    }
    if (error instanceof ChatServiceAuthSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("인증번호 요청에 실패했습니다.", 500);
  }
}
