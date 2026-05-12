import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import { CardRoomsSpringBackendHttpError, fetchCardRoomFromSpring } from "@/server/card-rooms-spring-client";
export const runtime = "nodejs";
export async function GET(_request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  try { return NextResponse.json(await fetchCardRoomFromSpring(roomId)); }
  catch (error) { if (error instanceof CardRoomsSpringBackendHttpError) return jsonError(error.message, error.status); console.error(error); return jsonError("카드방을 불러오지 못했습니다.", 500); }
}
