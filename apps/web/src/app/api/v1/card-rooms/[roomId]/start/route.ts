import type { YeonRequest } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { NextResponse } from "next/server";
import {
  CardRoomsSpringBackendHttpError,
  startCardRoomInSpring,
} from "@/server/card-rooms-spring-client";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";

export async function POST(
  request: YeonRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const participantId = request.headers.get("X-Yeon-Participant-Id");
  if (!participantId) return jsonError("참가자 식별자가 필요합니다.", 400);
  try {
    return NextResponse.json(
      await startCardRoomInSpring(roomId, participantId)
    );
  } catch (error) {
    if (error instanceof CardRoomsSpringBackendHttpError)
      return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("카드방 학습을 시작하지 못했습니다.", 500);
  }
}
