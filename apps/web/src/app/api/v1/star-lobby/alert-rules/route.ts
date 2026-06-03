import { createStarLobbyAlertRuleBodySchema } from "@yeon/api-contract/star-lobby";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import { resolveStarLobbyBffOwner } from "../_shared";
import {
  createStarLobbyAlertRuleInSpring,
  fetchStarLobbyAlertRulesFromSpring,
  StarLobbySpringBackendHttpError,
} from "@/server/star-lobby-spring-client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const owner = await resolveStarLobbyBffOwner(request);

  try {
    return NextResponse.json(await fetchStarLobbyAlertRulesFromSpring(owner));
  } catch (error) {
    if (error instanceof StarLobbySpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("스타 로비 알림 조건을 불러오지 못했습니다.", 500);
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = createStarLobbyAlertRuleBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ??
        "스타 로비 알림 조건 요청이 올바르지 않습니다.",
      400
    );
  }

  const owner = await resolveStarLobbyBffOwner(request);

  try {
    return NextResponse.json(
      await createStarLobbyAlertRuleInSpring({
        ...owner,
        payload: parsed.data,
      }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof StarLobbySpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("스타 로비 알림 조건을 저장하지 못했습니다.", 500);
  }
}
