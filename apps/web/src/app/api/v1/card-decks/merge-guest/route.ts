import { mergeGuestRequestSchema } from "@yeon/api-contract/card-deck-merge-guest";
import {
  errorResponseSchema,
  type ErrorResponseMeta,
} from "@yeon/api-contract/error";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  CardDeckMergeGuestSpringBackendHttpError,
  mergeGuestCardDecksInSpring,
} from "@/server/card-decks-merge-guest-spring-client";
import { ServiceError } from "@/server/errors/service-error";
import { getCurrentAuthUser } from "@/server/auth/session";

export const runtime = "nodejs";

function jsonError(
  message: string,
  status: number,
  detail?: ErrorResponseMeta
) {
  return NextResponse.json(errorResponseSchema.parse({ message, ...detail }), {
    status,
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentAuthUser();

  if (!user) {
    return jsonError("로그인 후 이용해 주세요.", 401);
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return jsonError("요청 본문을 해석할 수 없습니다.", 400);
  }

  const parsed = mergeGuestRequestSchema.safeParse(rawBody);

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ??
      "이관할 덱 데이터가 올바르지 않습니다.";
    return jsonError(message, 400);
  }

  try {
    const result = await mergeGuestCardDecksInSpring({
      userId: user.id,
      payload: parsed.data,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status, error.detail);
    }
    if (error instanceof CardDeckMergeGuestSpringBackendHttpError) {
      return jsonError(error.message, error.status, { code: error.code });
    }
    console.error("guest 덱 이관 처리 중 오류", error);
    return jsonError(
      "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      500
    );
  }
}
