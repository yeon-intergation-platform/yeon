import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createTypingRaceSeedBodySchema } from "@yeon/api-contract/typing-decks";

import {
  TypingDecksSpringBackendHttpError,
  createTypingRaceSeedInSpring,
} from "@/server/typing-decks-spring-client";
import { createTypingRaceSeedFromDetail } from "@/server/typing-race-seed";
import { getDefaultTypingDeckDetail } from "@/server/typing-deck-defaults";
import { ServiceError } from "@/server/services/service-error";

import { getOptionalAuthenticatedUser, jsonError } from "../../_shared";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  const { currentUser } = await getOptionalAuthenticatedUser(request);
  const { deckId } = await params;

  let body: unknown = {};
  try {
    const rawBody = await request.text();
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = createTypingRaceSeedBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("요청 데이터가 올바르지 않습니다.", 400);
  }

  const defaultDetail = getDefaultTypingDeckDetail(deckId);
  if (defaultDetail) {
    try {
      return NextResponse.json({
        raceSeed: createTypingRaceSeedFromDetail(
          defaultDetail,
          parsed.data.passageId,
        ),
      });
    } catch (error) {
      if (error instanceof ServiceError) {
        return jsonError(error.message, error.status);
      }
      throw error;
    }
  }

  try {
    const raceSeed = await createTypingRaceSeedInSpring(
      currentUser?.id ?? null,
      deckId,
      parsed.data,
    );
    return NextResponse.json(raceSeed);
  } catch (error) {
    if (error instanceof TypingDecksSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("레이스 문장을 준비하지 못했습니다.", 500);
  }
}
