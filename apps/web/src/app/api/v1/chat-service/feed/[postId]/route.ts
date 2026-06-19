import {
  chatServiceDeleteFeedPostBodySchema,
  chatServiceFeedPostActionResponseSchema,
  chatServiceUpdateFeedPostBodySchema,
} from "@yeon/api-contract/chat-service";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ChatServiceFeedSpringBackendHttpError,
  deleteChatServiceFeedPostInSpring,
  fetchChatServiceFeedPostFromSpring,
  updateChatServiceFeedPostInSpring,
} from "@/server/chat-service-feed-spring-client";
import {
  ChatServiceAuthSpringBackendHttpError,
  resolveChatServiceGuestProfileInSpring,
} from "@/server/chat-service-auth-spring-client";
import { ServiceError } from "@/server/errors/service-error";
import {
  getOptionalChatServiceAuth,
  jsonChatServiceError,
  parseJsonBody,
} from "@/app/api/v1/chat-service/_shared";

type FeedPostParams = {
  params: Promise<{
    postId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: FeedPostParams) {
  try {
    const auth = await getOptionalChatServiceAuth(request);
    const { postId } = await params;
    const response = await fetchChatServiceFeedPostFromSpring({
      currentProfileId: auth?.profile.id,
      postId,
    });

    return NextResponse.json(
      chatServiceFeedPostActionResponseSchema.parse(response)
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status, error.detail);
    }
    if (error instanceof ChatServiceFeedSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status, {
        code: error.code,
      });
    }
    if (error instanceof ChatServiceAuthSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("글을 불러오지 못했습니다.", 500);
  }
}

async function resolveFeedProfileId(
  request: NextRequest,
  actor:
    | z.infer<typeof chatServiceUpdateFeedPostBodySchema>
    | z.infer<typeof chatServiceDeleteFeedPostBodySchema>
) {
  const auth = await getOptionalChatServiceAuth(request);

  if (auth?.profile?.id) {
    return auth.profile.id;
  }

  if (!actor.guestNickname || !actor.guestPassword) {
    throw new ServiceError(
      400,
      "로그인이 없거나 닉네임/비밀번호를 함께 입력해 주세요."
    );
  }

  const profile = await resolveChatServiceGuestProfileInSpring({
    guestNickname: actor.guestNickname,
    guestPassword: actor.guestPassword,
  });

  return profile.id;
}

export async function PATCH(request: NextRequest, { params }: FeedPostParams) {
  try {
    const body = await parseJsonBody(request);
    const parsedBody = chatServiceUpdateFeedPostBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonChatServiceError("글 수정 입력값이 올바르지 않습니다.", 400);
    }

    const profileId = await resolveFeedProfileId(request, parsedBody.data);
    const { postId } = await params;
    const response = await updateChatServiceFeedPostInSpring({
      currentProfileId: profileId,
      postId,
      body: parsedBody.data.body,
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status, error.detail);
    }
    if (error instanceof ChatServiceFeedSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status, {
        code: error.code,
      });
    }
    if (error instanceof ChatServiceAuthSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("글을 수정하지 못했습니다.", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: FeedPostParams) {
  try {
    const body = await parseJsonBody(request);
    const parsedBody = chatServiceDeleteFeedPostBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonChatServiceError("글 삭제 입력값이 올바르지 않습니다.", 400);
    }

    const profileId = await resolveFeedProfileId(request, parsedBody.data);
    const { postId } = await params;
    const response = await deleteChatServiceFeedPostInSpring({
      currentProfileId: profileId,
      postId,
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status, error.detail);
    }
    if (error instanceof ChatServiceFeedSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status, {
        code: error.code,
      });
    }
    if (error instanceof ChatServiceAuthSpringBackendHttpError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("글을 삭제하지 못했습니다.", 500);
  }
}
