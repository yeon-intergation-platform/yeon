import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateTypingDeckPassageBodySchema } from "@yeon/api-contract/typing-decks";

import {
  TypingDecksSpringBackendHttpError,
  deleteTypingDeckPassageInSpring,
  updateTypingDeckPassageInSpring,
} from "@/server/typing-decks-spring-client";
import { ServiceError } from "@/server/errors/service-error";

import {
  getTypingDeckRequestContext,
  jsonError,
  readJsonBody,
} from "../../../_shared";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string; passageId: string }> },
) {
  const { deckId, passageId } = await params;

  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = updateTypingDeckPassageBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("수정 요청 형식이 올바르지 않습니다.", 400);
  }

  try {
    const { currentUser, isAdmin } = await getTypingDeckRequestContext(request);
    const passage = await updateTypingDeckPassageInSpring(
      currentUser?.id ?? null,
      deckId,
      passageId,
      parsed.data,
      isAdmin,
    );
    return NextResponse.json(passage);
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    if (error instanceof TypingDecksSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("연습 문장을 수정하지 못했습니다.", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string; passageId: string }> },
) {
  const { deckId, passageId } = await params;

  try {
    const { currentUser, isAdmin } = await getTypingDeckRequestContext(request);
    await deleteTypingDeckPassageInSpring(
      currentUser?.id ?? null,
      deckId,
      passageId,
      isAdmin,
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    if (error instanceof TypingDecksSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("연습 문장을 삭제하지 못했습니다.", 500);
  }
}
