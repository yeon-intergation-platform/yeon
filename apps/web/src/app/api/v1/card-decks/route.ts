import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createCardDeckBodySchema } from "@yeon/api-contract/card-decks";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  CardDecksSpringBackendHttpError,
  createCardDeckInSpring,
  fetchCardDecksFromSpring,
} from "@/server/card-decks-spring-client";
import { listCardDecks as listCardDecksFromNextDb } from "@/server/services/card-decks-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  try {
    const decks = await fetchCardDecksFromSpring(currentUser.id);
    return NextResponse.json(decks);
  } catch (error) {
    if (error instanceof CardDecksSpringBackendHttpError) {
      try {
        const decks = await listCardDecksFromNextDb(currentUser.id);
        return NextResponse.json({ decks });
      } catch (fallbackError) {
        console.error(fallbackError);
        return jsonError("덱 목록을 불러오지 못했습니다.", 500);
      }
    }
    console.error(error);
    return jsonError("덱 목록을 불러오지 못했습니다.", 500);
  }
}

export async function POST(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = createCardDeckBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("요청 데이터가 올바르지 않습니다.", 400);
  }

  try {
    const deck = await createCardDeckInSpring(currentUser.id, parsed.data);
    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    if (error instanceof CardDecksSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("덱을 생성하지 못했습니다.", 500);
  }
}
