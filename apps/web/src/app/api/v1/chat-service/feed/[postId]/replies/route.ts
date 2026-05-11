import {
  chatServiceCreateFeedPostResponseSchema,
  chatServiceFeedActorBaseSchema,
  chatServiceListFeedRepliesResponseSchema,
  chatServiceWriteFeedPostBodySchema,
} from "@yeon/api-contract/chat-service";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  createChatServiceFeedPost,
  deleteChatServiceFeedPost,
  listChatServiceFeedReplies,
} from "@/server/services/chat-service/feed-service";
import { getOrCreateChatServiceGuestProfile } from "@/server/services/chat-service/common";
import { ServiceError } from "@/server/services/service-error";

import {
  getOptionalChatServiceAuth,
  jsonChatServiceError,
  parseJsonBody,
} from "@/app/api/v1/chat-service/_shared";

type FeedReplyParams = {
  params: Promise<{
    postId: string;
  }>;
};

const deleteReplyBodySchema = chatServiceFeedActorBaseSchema
  .merge(
    z.object({
      replyId: z.string().uuid(),
    })
  )
  .superRefine((value, context) => {
    const hasNickname = Boolean(value.guestNickname?.trim().length);
    const hasPassword = Boolean(value.guestPassword?.trim().length);

    if ((hasNickname && !hasPassword) || (!hasNickname && hasPassword)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "비로그인 작성 시 닉네임과 비밀번호는 함께 입력해야 합니다.",
        path: ["guestNickname", "guestPassword"],
      });
    }
  });

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

  const profile = await getOrCreateChatServiceGuestProfile({
    guestNickname: parsedBody.guestNickname,
    guestPassword: parsedBody.guestPassword,
  });

  return profile.id;
}

export async function GET(request: NextRequest, { params }: FeedReplyParams) {
  try {
    const auth = await getOptionalChatServiceAuth(request);
    const { postId } = await params;
    const response = await listChatServiceFeedReplies(auth?.profile.id, postId);

    return NextResponse.json(
      chatServiceListFeedRepliesResponseSchema.parse(response)
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("답글 목록을 불러오지 못했습니다.", 500);
  }
}

export async function POST(request: NextRequest, { params }: FeedReplyParams) {
  try {
    const body = await parseJsonBody(request);
    const parsedBody = chatServiceWriteFeedPostBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonChatServiceError("답글 입력값이 올바르지 않습니다.", 400);
    }

    const profileId = await resolveFeedProfileId(request, parsedBody.data);
    const { postId } = await params;
    const response = await createChatServiceFeedPost(
      profileId,
      parsedBody.data.body,
      postId
    );

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

    console.error(error);
    return jsonChatServiceError("답글을 생성하지 못했습니다.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    const parsedBody = deleteReplyBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonChatServiceError("답글 삭제 정보가 올바르지 않습니다.", 400);
    }

    const auth = await getOptionalChatServiceAuth(request);
    const profileId = await (async () => {
      if (auth?.profile?.id) {
        return auth.profile.id;
      }

      if (!parsedBody.data.guestNickname || !parsedBody.data.guestPassword) {
        throw new ServiceError(
          400,
          "로그인이 없거나 닉네임/비밀번호를 함께 입력해 주세요."
        );
      }

      const profile = await getOrCreateChatServiceGuestProfile({
        guestNickname: parsedBody.data.guestNickname,
        guestPassword: parsedBody.data.guestPassword,
      });

      return profile.id;
    })();

    const response = await deleteChatServiceFeedPost(
      profileId,
      parsedBody.data.replyId
    );

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonChatServiceError(error.message, error.status);
    }

    console.error(error);
    return jsonChatServiceError("답글을 삭제하지 못했습니다.", 500);
  }
}
