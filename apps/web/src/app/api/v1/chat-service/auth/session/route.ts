import { chatServiceSessionResponseSchema } from "@yeon/api-contract/chat-service";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ChatServiceAuthSpringBackendHttpError,
  fetchChatServiceSessionFromSpring,
  logoutChatServiceSessionInSpring,
} from "@/server/chat-service-auth-spring-client";
import { ServiceError } from "@/server/errors/service-error";
import {
  clearChatServiceSessionCookie,
  getChatServiceSessionToken,
  jsonChatServiceError,
} from "@/app/api/v1/chat-service/_shared";

export async function GET(request: NextRequest) {
  try {
    const response = await fetchChatServiceSessionFromSpring(
      getChatServiceSessionToken(request)
    );

    return NextResponse.json(chatServiceSessionResponseSchema.parse(response));
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status, error.detail);
    }
    if (error instanceof ChatServiceAuthSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status, {
        code: error.code,
      });
    }

    console.error(error);
    return jsonChatServiceError("세션 정보를 불러오지 못했습니다.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = await logoutChatServiceSessionInSpring(
      getChatServiceSessionToken(request)
    );
    const nextResponse = NextResponse.json(
      chatServiceSessionResponseSchema.parse(response)
    );

    clearChatServiceSessionCookie(nextResponse);

    return nextResponse;
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status, error.detail);
    }
    if (error instanceof ChatServiceAuthSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status, {
        code: error.code,
      });
    }

    console.error(error);
    return jsonChatServiceError("로그아웃에 실패했습니다.", 500);
  }
}
