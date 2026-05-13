import {
  chatServiceCreateFeedPostResponseSchema,
  chatServiceWriteFeedPostBodySchema,
  chatServiceListFeedResponseSchema,
} from "@yeon/api-contract/chat-service";
import type { z } from "zod";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ServiceError } from "@/server/errors/service-error";
import {
  ChatServiceFeedSpringBackendHttpError,
  createChatServiceFeedPostInSpring,
  fetchChatServiceFeedFromSpring,
} from "@/server/chat-service-feed-spring-client";
import {
  ChatServiceAuthSpringBackendHttpError,
  resolveChatServiceGuestProfileInSpring,
} from "@/server/chat-service-auth-spring-client";

import {
  jsonChatServiceError,
  parseJsonBody,
  getOptionalChatServiceAuth,
} from "@/app/api/v1/chat-service/_shared";

async function resolveFeedProfileId(
  request: NextRequest,
  parsedBody: z.infer<typeof chatServiceWriteFeedPostBodySchema>
) {
  const auth = await getOptionalChatServiceAuth(request);

  if (auth?.profile?.id) {
    return auth.profile.id;
  }

  if (!parsedBody.guestNickname || !parsedBody.guestPassword) {
    throw new ServiceError(
      400,
      "로그인이 없거나 닉네임/비밀번호를 함께 입력해 주세요."
    );
  }

  const profile = await resolveChatServiceGuestProfileInSpring({
    guestNickname: parsedBody.guestNickname,
    guestPassword: parsedBody.guestPassword,
  });

  return profile.id;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getOptionalChatServiceAuth(request);
    const response = await fetchChatServiceFeedFromSpring(auth?.profile.id);

    return NextResponse.json(chatServiceListFeedResponseSchema.parse(response));
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status);
    }
    if (error instanceof ChatServiceFeedSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }
    if (error instanceof ChatServiceAuthSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("피드를 불러오지 못했습니다.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    const parsedBody = chatServiceWriteFeedPostBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonChatServiceError("피드 글 입력값이 올바르지 않습니다.", 400);
    }

    const profileId = await resolveFeedProfileId(request, parsedBody.data);
    const response = await createChatServiceFeedPostInSpring({
      currentProfileId: profileId,
      body: parsedBody.data.body,
    });

    return NextResponse.json(
      chatServiceCreateFeedPostResponseSchema.parse(response),
      {
        status: 201,
      }
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status);
    }
    if (error instanceof ChatServiceFeedSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }
    if (error instanceof ChatServiceAuthSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("피드 글을 생성하지 못했습니다.", 500);
  }
}
