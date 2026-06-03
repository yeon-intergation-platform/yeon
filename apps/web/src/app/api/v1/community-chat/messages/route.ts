import {
  communityChatListMessagesResponseSchema,
  communityChatSendMessageBodySchema,
  communityChatSendMessageResponseSchema,
} from "@yeon/api-contract/community-chat";
import type { YeonRequest } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { NextResponse } from "next/server";
import {
  CommunityChatSpringBackendHttpError,
  fetchCommunityChatMessagesFromSpring,
  sendCommunityChatMessageToSpring,
} from "@/server/community-chat-spring-client";

const COMMUNITY_CHAT_LIST_ERROR_MESSAGE =
  "커뮤니티 채팅을 불러오지 못했습니다.";
const COMMUNITY_CHAT_SEND_ERROR_MESSAGE =
  "커뮤니티 채팅 메시지를 전송하지 못했습니다.";
const DEFAULT_COMMUNITY_CHAT_NICKNAME = "익명이";

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

async function readJson(request: YeonRequest) {
  return request.json().catch(() => null) as Promise<unknown>;
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

export async function POST(request: YeonRequest) {
  try {
    const body = await readJson(request);
    const parsed = communityChatSendMessageBodySchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("채팅 메시지 입력값이 올바르지 않습니다.", 400);
    }

    const senderNickname =
      parsed.data.guestNickname?.trim() || DEFAULT_COMMUNITY_CHAT_NICKNAME;

    const response = await sendCommunityChatMessageToSpring({
      userId: null,
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
