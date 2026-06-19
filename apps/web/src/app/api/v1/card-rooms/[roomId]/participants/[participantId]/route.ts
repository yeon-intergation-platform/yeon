import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateCardRoomParticipantBodySchema } from "@yeon/api-contract/card-rooms";
import { getCurrentAuthUser } from "@/server/auth/session";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import {
  CardRoomsSpringBackendHttpError,
  leaveCardRoomInSpring,
  updateCardRoomParticipantInSpring,
} from "@/server/card-rooms-spring-client";

export const runtime = "nodejs";

// finding 165(IDOR): PATCH/DELETE는 호출자(X-Yeon-User-Id/X-Yeon-Guest-Id)가 해당
// participantId의 실제 소유자인지 Spring에서 검증해야 한다. 따라서 BFF는 join 라우트와
// 동일하게 세션 사용자 id와 게스트 id를 추출해 Spring으로 전달한다(소유권 판정은 Spring).
function resolveGuestId(request: NextRequest) {
  return (
    request.headers.get("x-yeon-guest-id") ||
    request.cookies.get("yeon_card_room_guest_id")?.value ||
    null
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string; participantId: string }> }
) {
  const { roomId, participantId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = updateCardRoomParticipantBodySchema.safeParse(body);
  if (!parsed.success)
    return jsonError("참가자 상태 요청이 올바르지 않습니다.", 400);

  const user = await getCurrentAuthUser();
  const guestId = resolveGuestId(request);

  try {
    return NextResponse.json(
      await updateCardRoomParticipantInSpring({
        roomId,
        participantId,
        userId: user?.id ?? null,
        guestId,
        payload: parsed.data,
      })
    );
  } catch (error) {
    if (error instanceof CardRoomsSpringBackendHttpError)
      return jsonError(error.message, error.status, { code: error.code });
    console.error(error);
    return jsonError("참가자 상태를 저장하지 못했습니다.", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string; participantId: string }> }
) {
  const { roomId, participantId } = await params;

  const user = await getCurrentAuthUser();
  const guestId = resolveGuestId(request);

  try {
    return NextResponse.json(
      await leaveCardRoomInSpring({
        roomId,
        participantId,
        userId: user?.id ?? null,
        guestId,
      })
    );
  } catch (error) {
    if (error instanceof CardRoomsSpringBackendHttpError)
      return jsonError(error.message, error.status, { code: error.code });
    console.error(error);
    return jsonError("카드방에서 나가지 못했습니다.", 500);
  }
}
