import { NextResponse } from "next/server";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import {
  fetchStarLobbyRoomsFromSpring,
  StarLobbySpringBackendHttpError,
} from "@/server/star-lobby-spring-client";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await fetchStarLobbyRoomsFromSpring());
  } catch (error) {
    if (error instanceof StarLobbySpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("스타 로비 현재 방 목록을 불러오지 못했습니다.", 500);
  }
}
