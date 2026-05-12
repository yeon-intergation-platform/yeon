import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateCardRoomParticipantBodySchema } from "@yeon/api-contract/card-rooms";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import { CardRoomsSpringBackendHttpError, leaveCardRoomInSpring, updateCardRoomParticipantInSpring } from "@/server/card-rooms-spring-client";
export const runtime = "nodejs";
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ roomId: string; participantId: string }> }) {
  const { roomId, participantId } = await params; let body: unknown; try { body = await request.json(); } catch { return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400); }
  const parsed = updateCardRoomParticipantBodySchema.safeParse(body); if (!parsed.success) return jsonError("참가자 상태 요청이 올바르지 않습니다.", 400);
  try { return NextResponse.json(await updateCardRoomParticipantInSpring({ roomId, participantId, payload: parsed.data })); }
  catch (error) { if (error instanceof CardRoomsSpringBackendHttpError) return jsonError(error.message, error.status); console.error(error); return jsonError("참가자 상태를 저장하지 못했습니다.", 500); }
}
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ roomId: string; participantId: string }> }) {
  const { roomId, participantId } = await params;
  try { return NextResponse.json(await leaveCardRoomInSpring(roomId, participantId)); }
  catch (error) { if (error instanceof CardRoomsSpringBackendHttpError) return jsonError(error.message, error.status); console.error(error); return jsonError("카드방에서 나가지 못했습니다.", 500); }
}
