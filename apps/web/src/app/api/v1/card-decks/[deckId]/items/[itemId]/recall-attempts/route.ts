import {
  createRecallAttemptBodySchema,
  recallGradeResponseSchema,
} from "@yeon/api-contract/recall";
import type { NextRequest } from "next/server";
import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  handleRecallRouteError,
  parseRecallUpstreamResponse,
  readRecallRequestJson,
  recallJson,
} from "@/app/api/v1/card-decks/_recall-route";
import { createRecallAttemptInSpring } from "@/server/card-recall-spring-client";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string; itemId: string }> }
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const raw = await readRecallRequestJson(request);
  if (raw.response) return raw.response;
  const parsed = createRecallAttemptBodySchema.safeParse(raw.body);
  if (!parsed.success) {
    return jsonError("백지 답안 형식이 올바르지 않습니다.", 400);
  }

  const { deckId, itemId } = await params;
  try {
    const result = await createRecallAttemptInSpring(
      currentUser.id,
      deckId,
      itemId,
      parsed.data
    );
    return recallJson(
      parseRecallUpstreamResponse(recallGradeResponseSchema, result),
      201
    );
  } catch (error) {
    return handleRecallRouteError(error, "백지 답안을 채점하지 못했습니다.");
  }
}
