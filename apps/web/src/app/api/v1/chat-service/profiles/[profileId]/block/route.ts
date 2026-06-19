import { chatServiceBlockProfileResponseSchema } from "@yeon/api-contract/chat-service";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ChatServiceBlockSpringBackendHttpError,
  blockChatServiceProfileInSpring,
  unblockChatServiceProfileInSpring,
} from "@/server/chat-service-block-spring-client";
import { ServiceError } from "@/server/errors/service-error";
import {
  jsonChatServiceError,
  requireChatServiceAuth,
} from "@/app/api/v1/chat-service/_shared";

type Params = {
  params: Promise<{
    profileId: string;
  }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { profile } = await requireChatServiceAuth(request);
    const { profileId } = await params;
    const response = await blockChatServiceProfileInSpring(
      profile.id,
      profileId
    );

    return NextResponse.json(
      chatServiceBlockProfileResponseSchema.parse(response)
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status, error.detail);
    }
    if (error instanceof ChatServiceBlockSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("차단 처리에 실패했습니다.", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { profile } = await requireChatServiceAuth(request);
    const { profileId } = await params;
    const response = await unblockChatServiceProfileInSpring(
      profile.id,
      profileId
    );

    return NextResponse.json(
      chatServiceBlockProfileResponseSchema.parse(response)
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status, error.detail);
    }
    if (error instanceof ChatServiceBlockSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("차단 해제에 실패했습니다.", 500);
  }
}
