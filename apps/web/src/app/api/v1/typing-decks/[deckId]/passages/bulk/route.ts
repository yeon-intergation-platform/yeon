import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createTypingDeckPassagesBodySchema } from "@yeon/api-contract/typing-decks";
import {
  TypingDecksSpringBackendHttpError,
  createTypingDeckPassagesInSpring,
} from "@/server/typing-decks-spring-client";
import { ServiceError } from "@/server/errors/service-error";
import {
  getTypingDeckRequestContext,
  jsonError,
  readJsonBody,
} from "../../../_shared";

export const runtime = "nodejs";

export async function POST(
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

  const parsed = createTypingDeckPassagesBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("요청 데이터가 올바르지 않습니다.", 400);
  }

  try {
    const { currentUser, isAdmin } = await getTypingDeckRequestContext(request);
    const passages = await createTypingDeckPassagesInSpring(
      currentUser?.id ?? null,
      deckId,
      parsed.data,
      isAdmin
    );
    return NextResponse.json(passages, { status: 201 });
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    if (error instanceof TypingDecksSpringBackendHttpError) {
      return jsonError(error.message, error.status, { code: error.code });
    }
    console.error(error);
    return jsonError("연습 문장을 일괄 추가하지 못했습니다.", 500);
  }
}
