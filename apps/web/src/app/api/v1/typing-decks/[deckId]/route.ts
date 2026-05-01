import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateTypingDeckBodySchema } from "@yeon/api-contract/typing-decks";

import {
  deleteTypingDeck,
  getTypingDeckDetail,
  updateTypingDeck,
} from "@/server/services/typing-decks-service";
import { ServiceError } from "@/server/services/service-error";

import {
  getOptionalAuthenticatedUser,
  jsonError,
  readJsonBody,
} from "../_shared";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  const { currentUser } = await getOptionalAuthenticatedUser(request);
  const { deckId } = await params;

  try {
    const detail = await getTypingDeckDetail(currentUser?.id ?? null, deckId);
    return NextResponse.json(detail);
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("타자 덱을 불러오지 못했습니다.", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  const { currentUser } = await getOptionalAuthenticatedUser(request);
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
    const deck = await updateTypingDeck(
      currentUser?.id ?? null,
      deckId,
      parsed.data,
    );
    return NextResponse.json({ deck });
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("타자 덱을 수정하지 못했습니다.", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  const { currentUser } = await getOptionalAuthenticatedUser(request);
  const { deckId } = await params;

  try {
    await deleteTypingDeck(currentUser?.id ?? null, deckId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("타자 덱을 삭제하지 못했습니다.", 500);
  }
}
