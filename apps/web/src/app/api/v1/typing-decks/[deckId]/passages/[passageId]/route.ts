import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateTypingDeckPassageBodySchema } from "@yeon/api-contract/typing-decks";

import {
  deleteTypingDeckPassage,
  updateTypingDeckPassage,
} from "@/server/services/typing-decks-service";
import { ServiceError } from "@/server/services/service-error";

import {
  getOptionalAuthenticatedUser,
  jsonError,
  readJsonBody,
} from "../../../_shared";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string; passageId: string }> },
) {
  const { currentUser } = await getOptionalAuthenticatedUser(request);
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
    const passage = await updateTypingDeckPassage(
      currentUser?.id ?? null,
      deckId,
      passageId,
      parsed.data,
    );
    return NextResponse.json({ passage });
  } catch (error) {
    if (error instanceof ServiceError) {
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
  const { currentUser } = await getOptionalAuthenticatedUser(request);
  const { deckId, passageId } = await params;

  try {
    await deleteTypingDeckPassage(currentUser?.id ?? null, deckId, passageId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("연습 문장을 삭제하지 못했습니다.", 500);
  }
}
