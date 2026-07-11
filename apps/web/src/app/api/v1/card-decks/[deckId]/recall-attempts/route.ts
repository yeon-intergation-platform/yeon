import {
  recallAttemptListQuerySchema,
  recallAttemptListResponseSchema,
} from "@yeon/api-contract/recall";
import type { NextRequest } from "next/server";
import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  handleRecallRouteError,
  parseRecallUpstreamResponse,
  recallJson,
} from "@/app/api/v1/card-decks/_recall-route";
import { fetchRecallAttemptsFromSpring } from "@/server/card-recall-spring-client";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;
  const parsed = recallAttemptListQuerySchema.safeParse({
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return jsonError("백지 기록 조회 범위가 올바르지 않습니다.", 400);
  }

  const { deckId } = await params;
  try {
    const result = await fetchRecallAttemptsFromSpring(
      currentUser.id,
      deckId,
      parsed.data.limit
    );
    return recallJson(
      parseRecallUpstreamResponse(recallAttemptListResponseSchema, result)
    );
  } catch (error) {
    return handleRecallRouteError(error, "백지 기록을 불러오지 못했습니다.");
  }
}
