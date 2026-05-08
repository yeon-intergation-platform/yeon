import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateCardStudyPreferenceBodySchema } from "@yeon/api-contract/card-decks";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  CardDecksSpringBackendHttpError,
  fetchCardStudyPreferenceFromSpring,
  updateCardStudyPreferenceInSpring,
} from "@/server/card-decks-spring-client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  try {
    const studyMode = await fetchCardStudyPreferenceFromSpring(currentUser.id);
    return NextResponse.json(studyMode);
  } catch (error) {
    if (error instanceof CardDecksSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("카드 학습 설정을 불러오지 못했습니다.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = updateCardStudyPreferenceBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("학습 모드 설정값이 올바르지 않습니다.", 400);
  }

  try {
    const studyMode = await updateCardStudyPreferenceInSpring(currentUser.id, parsed.data);
    return NextResponse.json(studyMode);
  } catch (error) {
    if (error instanceof CardDecksSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("카드 학습 설정을 저장하지 못했습니다.", 500);
  }
}
