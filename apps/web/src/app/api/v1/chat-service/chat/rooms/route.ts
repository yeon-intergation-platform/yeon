import { chatServiceListChatRoomsResponseSchema } from "@yeon/api-contract/chat-service";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ChatServiceChatRoomsSpringBackendHttpError,
  fetchChatServiceRoomsFromSpring,
} from "@/server/chat-service-chat-rooms-spring-client";
import { ServiceError } from "@/server/services/service-error";

import {
  jsonChatServiceError,
  requireChatServiceAuth,
} from "@/app/api/v1/chat-service/_shared";

export async function GET(request: NextRequest) {
  try {
    const { profile } = await requireChatServiceAuth(request);
    const response = await fetchChatServiceRoomsFromSpring(profile.id);

    return NextResponse.json(
      chatServiceListChatRoomsResponseSchema.parse(response),
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status);
    }
    if (error instanceof ChatServiceChatRoomsSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("대화방 목록을 불러오지 못했습니다.", 500);
  }
}
