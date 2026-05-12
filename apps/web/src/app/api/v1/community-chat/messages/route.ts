import {
  communityChatListMessagesResponseSchema,
  communityChatSendMessageBodySchema,
  communityChatSendMessageResponseSchema,
} from "@yeon/api-contract/community-chat";
import { NextResponse } from "next/server";

import { getCurrentAuthUser } from "@/server/auth/session";
import {
  CommunityChatSpringBackendHttpError,
  fetchCommunityChatMessagesFromSpring,
  sendCommunityChatMessageToSpring,
} from "@/server/community-chat-spring-client";

const COMMUNITY_CHAT_LIST_ERROR_MESSAGE =
  "커뮤니티 채팅을 불러오지 못했습니다.";
const COMMUNITY_CHAT_SEND_ERROR_MESSAGE =
  "커뮤니티 채팅 메시지를 전송하지 못했습니다.";

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

async function readJson(request: Request) {
  return request.json().catch(() => null) as Promise<unknown>;
}

async function getOptionalCommunityChatUser() {
  try {
    return await getCurrentAuthUser();
  } catch (error) {
    console.warn(
      "커뮤니티 채팅 사용자 세션 조회에 실패해 게스트로 처리합니다.",
      error
    );
    return null;
  }
}

export async function GET() {
  try {
    const response = await fetchCommunityChatMessagesFromSpring();
    return NextResponse.json(
      communityChatListMessagesResponseSchema.parse(response)
    );
  } catch (error) {
    if (error instanceof CommunityChatSpringBackendHttpError) {
      return jsonError(COMMUNITY_CHAT_LIST_ERROR_MESSAGE, error.status);
    }

    console.error(error);
    return jsonError(COMMUNITY_CHAT_LIST_ERROR_MESSAGE, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const parsed = communityChatSendMessageBodySchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("채팅 메시지 입력값이 올바르지 않습니다.", 400);
    }

    const currentUser = await getOptionalCommunityChatUser();
    const senderNickname =
      currentUser?.displayName?.trim() ||
      currentUser?.email.split("@")[0]?.trim() ||
      parsed.data.guestNickname;

    const response = await sendCommunityChatMessageToSpring({
      userId: currentUser?.id ?? null,
      payload: {
        ...parsed.data,
        senderNickname,
      },
    });

    return NextResponse.json(
      communityChatSendMessageResponseSchema.parse(response),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof CommunityChatSpringBackendHttpError) {
      return jsonError(COMMUNITY_CHAT_SEND_ERROR_MESSAGE, error.status);
    }

    console.error(error);
    return jsonError(COMMUNITY_CHAT_SEND_ERROR_MESSAGE, 500);
  }
}
