import { upsertStarLobbyDiscordWebhookBodySchema } from "@yeon/api-contract/star-lobby";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import { resolveStarLobbyBffOwner } from "../_shared";
import {
  deleteStarLobbyDiscordWebhookInSpring,
  fetchStarLobbyDiscordWebhookStatusFromSpring,
  StarLobbySpringBackendHttpError,
  upsertStarLobbyDiscordWebhookInSpring,
} from "@/server/star-lobby-spring-client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const owner = await resolveStarLobbyBffOwner(request);

  try {
    return NextResponse.json(
      await fetchStarLobbyDiscordWebhookStatusFromSpring(owner)
    );
  } catch (error) {
    if (error instanceof StarLobbySpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("스타 로비 Discord 알림 상태를 불러오지 못했습니다.", 500);
  }
}

export async function PUT(request: NextRequest) {
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
        "Discord 웹훅 URL 요청이 올바르지 않습니다.",
      400
    );
  }

  const owner = await resolveStarLobbyBffOwner(request);

  try {
    return NextResponse.json(
      await upsertStarLobbyDiscordWebhookInSpring({
        ...owner,
        payload: parsed.data,
      })
    );
  } catch (error) {
    if (error instanceof StarLobbySpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("스타 로비 Discord 알림을 연결하지 못했습니다.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const owner = await resolveStarLobbyBffOwner(request);

  try {
    return NextResponse.json(
      await deleteStarLobbyDiscordWebhookInSpring(owner)
    );
  } catch (error) {
    if (error instanceof StarLobbySpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("스타 로비 Discord 알림 연결을 해제하지 못했습니다.", 500);
  }
}
