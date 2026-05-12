import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createCardRoomMessageBodySchema } from "@yeon/api-contract/card-rooms";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import { CardRoomsSpringBackendHttpError, createCardRoomMessageInSpring } from "@/server/card-rooms-spring-client";
export const runtime = "nodejs";
export async function POST(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params; const participantId = request.headers.get("x-yeon-participant-id"); if (!participantId) return jsonError("참가자 식별자가 필요합니다.", 400);
  let body: unknown; try { body = await request.json(); } catch { return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400); }
  const parsed = createCardRoomMessageBodySchema.safeParse(body); if (!parsed.success) return jsonError("메시지 형식이 올바르지 않습니다.", 400);
  try { return NextResponse.json(await createCardRoomMessageInSpring({ roomId, participantId, payload: parsed.data })); }
  catch (error) { if (error instanceof CardRoomsSpringBackendHttpError) return jsonError(error.message, error.status); console.error(error); return jsonError("메시지를 보내지 못했습니다.", 500); }
}
