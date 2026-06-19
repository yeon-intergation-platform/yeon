import { chatServiceGetProfileResponseSchema } from "@yeon/api-contract/chat-service";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ChatServiceProfileSpringBackendHttpError,
  fetchChatServiceProfileFromSpring,
} from "@/server/chat-service-profile-spring-client";
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

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { profile } = await requireChatServiceAuth(request);
    const { profileId } = await params;
    const response = await fetchChatServiceProfileFromSpring({
      currentProfileId: profile.id,
      targetProfileId: profileId,
    });

    return NextResponse.json(
      chatServiceGetProfileResponseSchema.parse(response)
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status, error.detail);
    }
    if (error instanceof ChatServiceProfileSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("프로필을 불러오지 못했습니다.", 500);
  }
}
