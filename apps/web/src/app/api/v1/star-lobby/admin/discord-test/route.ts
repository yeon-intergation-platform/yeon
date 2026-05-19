import { upsertStarLobbyDiscordWebhookBodySchema } from "@yeon/api-contract/star-lobby";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import { getCurrentAdminUser } from "@/server/auth/admin";
import {
  StarLobbySpringBackendHttpError,
  testStarLobbyDiscordWebhookInSpring,
} from "@/server/star-lobby-spring-client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdminUser();
  if (!admin) return jsonError("관리자 권한이 필요합니다.", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = upsertStarLobbyDiscordWebhookBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ??
        "Discord 테스트 웹훅 URL 요청이 올바르지 않습니다.",
      400
    );
  }

  try {
    return NextResponse.json(
      await testStarLobbyDiscordWebhookInSpring({ payload: parsed.data })
    );
  } catch (error) {
    if (error instanceof StarLobbySpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("스타 로비 Discord 테스트 알림을 보내지 못했습니다.", 500);
  }
}
