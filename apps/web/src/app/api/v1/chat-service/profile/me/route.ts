import {
  chatServiceDeleteAccountResponseSchema,
  chatServiceGetMyProfileResponseSchema,
  chatServiceUpdateMyProfileBodySchema,
  chatServiceUpdateMyProfileResponseSchema,
} from "@yeon/api-contract/chat-service";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ChatServiceMyProfileSpringBackendHttpError,
  deleteMyChatServiceProfileInSpring,
  fetchMyChatServiceProfileFromSpring,
  updateMyChatServiceProfileInSpring,
} from "@/server/chat-service-my-profile-spring-client";
import { ServiceError } from "@/server/errors/service-error";
import {
  clearChatServiceSessionCookie,
  jsonChatServiceError,
  parseJsonBody,
  requireChatServiceAuth,
} from "@/app/api/v1/chat-service/_shared";

export async function GET(request: NextRequest) {
  try {
    const { profile } = await requireChatServiceAuth(request);
    const response = await fetchMyChatServiceProfileFromSpring(profile.id);

    return NextResponse.json(
      chatServiceGetMyProfileResponseSchema.parse(response)
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status, error.detail);
    }
    if (error instanceof ChatServiceMyProfileSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("프로필을 불러오지 못했습니다.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { profile } = await requireChatServiceAuth(request);
    const body = await parseJsonBody(request);
    const parsedBody = chatServiceUpdateMyProfileBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonChatServiceError(
        "프로필 수정 입력값이 올바르지 않습니다.",
        400
      );
    }

    const response = await updateMyChatServiceProfileInSpring({
      currentProfileId: profile.id,
      nickname: parsedBody.data.nickname,
      ageLabel: parsedBody.data.ageLabel,
      regionLabel: parsedBody.data.regionLabel,
      bio: parsedBody.data.bio,
      notificationsEnabled: parsedBody.data.notificationsEnabled,
    });

    return NextResponse.json(
      chatServiceUpdateMyProfileResponseSchema.parse(response)
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status, error.detail);
    }
    if (error instanceof ChatServiceMyProfileSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("프로필을 수정하지 못했습니다.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { profile } = await requireChatServiceAuth(request);
    const response = await deleteMyChatServiceProfileInSpring(profile.id);
    const nextResponse = NextResponse.json(
      chatServiceDeleteAccountResponseSchema.parse(response)
    );

    clearChatServiceSessionCookie(nextResponse);

    return nextResponse;
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status, error.detail);
    }
    if (error instanceof ChatServiceMyProfileSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("계정을 삭제하지 못했습니다.", 500);
  }
}
