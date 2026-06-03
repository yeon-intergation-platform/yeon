import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateTypingDeckBodySchema } from "@yeon/api-contract/typing-decks";
import {
  TypingDecksSpringBackendHttpError,
  deleteTypingDeckInSpring,
  fetchTypingDeckDetailFromSpring,
  updateTypingDeckInSpring,
} from "@/server/typing-decks-spring-client";
import { getDefaultTypingDeckDetail } from "@/server/typing-deck-defaults";
import { ServiceError } from "@/server/errors/service-error";
import {
  getTypingDeckRequestContext,
  jsonError,
  readJsonBody,
} from "../_shared";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const { deckId } = await params;
  const defaultDetail = getDefaultTypingDeckDetail(deckId);
  if (defaultDetail) {
    return NextResponse.json(defaultDetail);
  }

  try {
    const { currentUser, isAdmin } = await getTypingDeckRequestContext(request);
    const detail = await fetchTypingDeckDetailFromSpring({
      userId: currentUser?.id ?? null,
      deckId,
      adminMode: isAdmin,
    });
    return NextResponse.json(detail);
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    if (error instanceof TypingDecksSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("타자 덱을 불러오지 못했습니다.", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const { deckId } = await params;

  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = updateTypingDeckBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("수정 요청 형식이 올바르지 않습니다.", 400);
  }

  try {
    const { currentUser, isAdmin } = await getTypingDeckRequestContext(request);
    const deck = await updateTypingDeckInSpring(
      currentUser?.id ?? null,
      deckId,
      parsed.data,
      isAdmin
    );
    return NextResponse.json(deck);
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    if (error instanceof TypingDecksSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("타자 덱을 수정하지 못했습니다.", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const { deckId } = await params;

  try {
    const { currentUser, isAdmin } = await getTypingDeckRequestContext(request);
    await deleteTypingDeckInSpring(currentUser?.id ?? null, deckId, isAdmin);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    if (error instanceof TypingDecksSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("타자 덱을 삭제하지 못했습니다.", 500);
  }
}
