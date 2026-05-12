import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { counselingChatRequestSchema } from "@yeon/api-contract/counseling-records";
import {
  clearCounselingRecordChatFromSpring,
  CounselingRecordChatSpringBackendHttpError,
  streamCounselingRecordChatFromSpring,
} from "@/server/counseling-record-chat-spring-client";

import { jsonError, requireAuthenticatedUser } from "../../_shared";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    recordId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { currentUser, response } = await requireAuthenticatedUser(request);

  if (!currentUser) {
    return response;
  }

  const { recordId } = await context.params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("요청 형식이 올바르지 않습니다.", 400);
  }

  const parsed = counselingChatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("메시지가 비어 있습니다.", 400);
  }

  const lastMessage = parsed.data.messages[parsed.data.messages.length - 1];

  if (lastMessage.role !== "user" || !lastMessage.content.trim()) {
    return jsonError("마지막 메시지는 사용자 메시지여야 합니다.", 400);
  }

  try {
    const stream = await streamCounselingRecordChatFromSpring(
      currentUser.id,
      recordId,
      parsed.data
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof CounselingRecordChatSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }

    console.error("counseling-ai-chat-error", error);
    return jsonError("AI 도우미 응답에 실패했습니다.", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { currentUser, response } = await requireAuthenticatedUser(request);

  if (!currentUser) {
    return response;
  }

  const { recordId } = await context.params;

  try {
    await clearCounselingRecordChatFromSpring(currentUser.id, recordId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof CounselingRecordChatSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }

    console.error("counseling-ai-chat-clear-error", error);
    return jsonError("채팅 기록을 초기화하지 못했습니다.", 500);
  }
}
