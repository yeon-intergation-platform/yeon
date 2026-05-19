import { NextResponse } from "next/server";

import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import { getCurrentAdminUser } from "@/server/auth/admin";
import {
  fetchStarLobbyDiscordAdminStatusFromSpring,
  StarLobbySpringBackendHttpError,
} from "@/server/star-lobby-spring-client";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return jsonError("관리자 권한이 필요합니다.", 403);

  try {
    return NextResponse.json(
      await fetchStarLobbyDiscordAdminStatusFromSpring()
    );
  } catch (error) {
    if (error instanceof StarLobbySpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("스타 로비 Discord 운영 상태를 불러오지 못했습니다.", 500);
  }
}
