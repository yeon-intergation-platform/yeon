import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import { CardRoomsSpringBackendHttpError, nextCardRoomCardInSpring } from "@/server/card-rooms-spring-client";
export const runtime = "nodejs";
export async function POST(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params; const participantId = request.headers.get("x-yeon-participant-id"); if (!participantId) return jsonError("참가자 식별자가 필요합니다.", 400);
  try { return NextResponse.json(await nextCardRoomCardInSpring(roomId, participantId)); }
  catch (error) { if (error instanceof CardRoomsSpringBackendHttpError) return jsonError(error.message, error.status); console.error(error); return jsonError("다음 카드로 이동하지 못했습니다.", 500); }
}
