import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  createTypingDeckBodySchema,
  typingDeckListQuerySchema,
  type TypingDeckListQuery,
} from "@yeon/api-contract/typing-decks";
import {
  TypingDecksSpringBackendHttpError,
  createTypingDeckInSpring,
  fetchTypingDecksFromSpring,
} from "@/server/typing-decks-spring-client";
import {
  listDefaultTypingDecks,
  shouldPrependDefaultTypingDecks,
} from "@/server/typing-deck-defaults";
import { ServiceError } from "@/server/errors/service-error";
import {
  getTypingDeckRequestContext,
  jsonError,
  readJsonBody,
} from "./_shared";

export const runtime = "nodejs";

function canFallbackToDefaultDecks(
  request: NextRequest,
  status: number,
  query: TypingDeckListQuery
) {
  return (
    request.nextUrl.searchParams.get("admin") !== "1" &&
    (status === 401 || status === 403) &&
    shouldPrependDefaultTypingDecks(query)
  );
}

function defaultDeckListResponse(query: TypingDeckListQuery) {
  return NextResponse.json({
    decks: listDefaultTypingDecks(query.languageTag),
  });
}

export async function GET(request: NextRequest) {
  const parsedQuery = typingDeckListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  );
  if (!parsedQuery.success) {
    return jsonError("목록 요청 형식이 올바르지 않습니다.", 400);
  }

  if (parsedQuery.data.scope === "default") {
    return NextResponse.json({
      decks: listDefaultTypingDecks(parsedQuery.data.languageTag),
    });
  }

  try {
    const { currentUser, isAdmin } = await getTypingDeckRequestContext(request);
    const spring = await fetchTypingDecksFromSpring({
      userId: currentUser?.id ?? null,
      scope: parsedQuery.data.scope,
      languageTag: parsedQuery.data.languageTag,
      adminMode: isAdmin,
    });
    const defaults = shouldPrependDefaultTypingDecks(parsedQuery.data)
      ? listDefaultTypingDecks(parsedQuery.data.languageTag)
      : [];

    return NextResponse.json({ decks: [...defaults, ...spring.decks] });
  } catch (error) {
    if (error instanceof ServiceError) {
      if (canFallbackToDefaultDecks(request, error.status, parsedQuery.data)) {
        return defaultDeckListResponse(parsedQuery.data);
      }
      return jsonError(error.message, error.status);
    }
    if (error instanceof TypingDecksSpringBackendHttpError) {
      if (canFallbackToDefaultDecks(request, error.status, parsedQuery.data)) {
        return defaultDeckListResponse(parsedQuery.data);
      }
      return jsonError(error.message, error.status, { code: error.code });
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
    const created = await createTypingDeckInSpring(
      currentUser?.id ?? null,
      parsed.data,
      isAdmin
    );
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    if (error instanceof TypingDecksSpringBackendHttpError) {
      return jsonError(error.message, error.status, { code: error.code });
    }
    console.error(error);
    return jsonError("타자 덱을 생성하지 못했습니다.", 500);
  }
}
