import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createCardRoomBodySchema } from "@yeon/api-contract/card-rooms";
import { getCurrentAuthUser } from "@/server/auth/session";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import { CardRoomsSpringBackendHttpError, createCardRoomInSpring, fetchCardRoomsFromSpring } from "@/server/card-rooms-spring-client";

export const runtime = "nodejs";

export async function GET() {
  try { return NextResponse.json(await fetchCardRoomsFromSpring()); }
  catch (error) { if (error instanceof CardRoomsSpringBackendHttpError) return jsonError(error.message, error.status); console.error(error); return jsonError("카드방 목록을 불러오지 못했습니다.", 500); }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400); }
  const parsed = createCardRoomBodySchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "카드방 생성 요청이 올바르지 않습니다.", 400);
  const user = await getCurrentAuthUser();
  const guestId = request.headers.get("x-yeon-guest-id") || request.cookies.get("yeon_card_room_guest_id")?.value || null;
  try {
    return NextResponse.json(await createCardRoomInSpring({ userId: user?.id ?? null, guestId, payload: parsed.data }), { status: 201 });
  } catch (error) { if (error instanceof CardRoomsSpringBackendHttpError) return jsonError(error.message, error.status); console.error(error); return jsonError("카드방을 만들지 못했습니다.", 500); }
}
