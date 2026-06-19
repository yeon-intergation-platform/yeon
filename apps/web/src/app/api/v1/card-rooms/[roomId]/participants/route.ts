import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { joinCardRoomBodySchema } from "@yeon/api-contract/card-rooms";
import { getCurrentAuthUser } from "@/server/auth/session";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import {
  CardRoomsSpringBackendHttpError,
  joinCardRoomInSpring,
} from "@/server/card-rooms-spring-client";
export const runtime = "nodejs";
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }
  const parsed = joinCardRoomBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("입장 요청이 올바르지 않습니다.", 400);
  const user = await getCurrentAuthUser();
  const guestId =
    request.headers.get("x-yeon-guest-id") ||
    request.cookies.get("yeon_card_room_guest_id")?.value ||
    null;
  try {
    return NextResponse.json(
      await joinCardRoomInSpring({
        roomId,
        userId: user?.id ?? null,
        guestId,
        payload: parsed.data,
      }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof CardRoomsSpringBackendHttpError)
      return jsonError(error.message, error.status, { code: error.code });
    console.error(error);
    return jsonError("카드방에 입장하지 못했습니다.", 500);
  }
}
