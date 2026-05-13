import { chatServiceGetChatRoomResponseSchema } from "@yeon/api-contract/chat-service";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ChatServiceChatRoomsSpringBackendHttpError,
  fetchChatServiceRoomFromSpring,
} from "@/server/chat-service-chat-rooms-spring-client";
import { ServiceError } from "@/server/errors/service-error";

import {
  jsonChatServiceError,
  requireChatServiceAuth,
} from "@/app/api/v1/chat-service/_shared";

type Params = {
  params: Promise<{
    roomId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { profile } = await requireChatServiceAuth(request);
    const { roomId } = await params;
    const response = await fetchChatServiceRoomFromSpring({
      currentProfileId: profile.id,
      roomId,
    });

    return NextResponse.json(
      chatServiceGetChatRoomResponseSchema.parse(response),
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status);
    }
    if (error instanceof ChatServiceChatRoomsSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("대화방을 불러오지 못했습니다.", 500);
  }
}
