import {
  communityChatListMessagesResponseSchema,
  communityChatSendMessageBodySchema,
  communityChatSendMessageResponseSchema,
} from "@yeon/api-contract/community-chat";
import type { ErrorResponseMeta } from "@yeon/api-contract/error";
import type { YeonRequest } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { NextResponse } from "next/server";
import {
  CommunityChatSpringBackendHttpError,
  fetchCommunityChatMessagesFromSpring,
  sendCommunityChatMessageToSpring,
} from "@/server/community-chat-spring-client";
import { getCurrentAuthUser } from "@/server/auth/session";

const COMMUNITY_CHAT_LIST_ERROR_MESSAGE =
  "커뮤니티 채팅을 불러오지 못했습니다.";
const COMMUNITY_CHAT_SEND_ERROR_MESSAGE =
  "커뮤니티 채팅 메시지를 전송하지 못했습니다.";
const DEFAULT_COMMUNITY_CHAT_NICKNAME = "익명이";

function jsonError(
  message: string,
  status: number,
  detail?: ErrorResponseMeta
) {
  return NextResponse.json({ message, ...detail }, { status });
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
      return jsonError(COMMUNITY_CHAT_LIST_ERROR_MESSAGE, error.status, {
        code: error.code,
      });
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

    // 커뮤니티는 공개(익명 허용)지만, 로그인 사용자가 작성하면 세션에서 도출한 userId를
    // 주입해 경험치를 적립받게 한다(익명은 null → 적립 없음). userId는 클라이언트가 아니라
    // 서버 세션에서만 도출하므로 위조 불가.
    const authUser = await getCurrentAuthUser().catch(() => null);

    const response = await sendCommunityChatMessageToSpring({
      userId: authUser?.id ?? null,
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
      return jsonError(COMMUNITY_CHAT_SEND_ERROR_MESSAGE, error.status, {
        code: error.code,
      });
    }

    console.error(error);
    return jsonError(COMMUNITY_CHAT_SEND_ERROR_MESSAGE, 500);
  }
}
