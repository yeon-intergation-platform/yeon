import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { reviewCardDeckItemBodySchema } from "@yeon/api-contract/card-decks";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  CardDecksSpringBackendHttpError,
  reviewCardDeckItemInSpring,
} from "@/server/card-decks-spring-client";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string; itemId: string }> },
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;
  const { deckId, itemId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = reviewCardDeckItemBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("복습 결과 형식이 올바르지 않습니다.", 400);
  }

  try {
    const item = await reviewCardDeckItemInSpring(currentUser.id, deckId, itemId, parsed.data);
    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof CardDecksSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("복습 결과를 저장하지 못했습니다.", 500);
  }
}
