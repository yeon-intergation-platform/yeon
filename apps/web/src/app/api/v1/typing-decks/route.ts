import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  createTypingDeckBodySchema,
  typingDeckListQuerySchema,
} from "@yeon/api-contract/typing-decks";

import {
  createTypingDeck,
  listTypingDecks,
} from "@/server/services/typing-decks-service";
import { ServiceError } from "@/server/services/service-error";

import {
  getTypingDeckRequestContext,
  jsonError,
  readJsonBody,
} from "./_shared";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const parsedQuery = typingDeckListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );
  if (!parsedQuery.success) {
    return jsonError("목록 요청 형식이 올바르지 않습니다.", 400);
  }

  try {
    const { currentUser, isAdmin } = await getTypingDeckRequestContext(request);
    const decks = await listTypingDecks(
      currentUser?.id ?? null,
      parsedQuery.data,
      { adminMode: isAdmin },
    );
    return NextResponse.json({ decks });
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("타자 덱 목록을 불러오지 못했습니다.", 500);
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = createTypingDeckBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("요청 데이터가 올바르지 않습니다.", 400);
  }

  try {
    const { currentUser, isAdmin } = await getTypingDeckRequestContext(request);
    const deck = await createTypingDeck(currentUser?.id ?? null, parsed.data, {
      adminMode: isAdmin,
    });
    return NextResponse.json({ deck }, { status: 201 });
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("타자 덱을 생성하지 못했습니다.", 500);
  }
}
