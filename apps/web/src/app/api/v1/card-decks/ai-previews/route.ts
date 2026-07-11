import {
  cardDeckAiPreviewResponseSchema,
  createCardDeckAiPreviewBodySchema,
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
import { createCardDeckAiPreviewInSpring } from "@/server/card-recall-spring-client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;
  const raw = await readRecallRequestJson(request);
  if (raw.response) return raw.response;
  const parsed = createCardDeckAiPreviewBodySchema.safeParse(raw.body);
  if (!parsed.success) {
    return jsonError("AI 카드 생성 요청 형식이 올바르지 않습니다.", 400);
  }

  try {
    const result = await createCardDeckAiPreviewInSpring(
      currentUser.id,
      parsed.data
    );
    return recallJson(
      parseRecallUpstreamResponse(cardDeckAiPreviewResponseSchema, result)
    );
  } catch (error) {
    return handleRecallRouteError(error, "AI 카드 초안을 만들지 못했습니다.");
  }
}
