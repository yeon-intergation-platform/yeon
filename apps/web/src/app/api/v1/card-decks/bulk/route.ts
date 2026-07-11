import {
  createCardDeckWithItemsBodySchema,
  createCardDeckWithItemsResponseSchema,
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
import { createCardDeckWithItemsInSpring } from "@/server/card-recall-spring-client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;
  const raw = await readRecallRequestJson(request);
  if (raw.response) return raw.response;
  const parsed = createCardDeckWithItemsBodySchema.safeParse(raw.body);
  if (!parsed.success) {
    return jsonError("덱 일괄 생성 요청 형식이 올바르지 않습니다.", 400);
  }

  try {
    const result = await createCardDeckWithItemsInSpring(
      currentUser.id,
      parsed.data
    );
    return recallJson(
      parseRecallUpstreamResponse(
        createCardDeckWithItemsResponseSchema,
        result
      ),
      201
    );
  } catch (error) {
    return handleRecallRouteError(error, "카드 덱을 저장하지 못했습니다.");
  }
}
