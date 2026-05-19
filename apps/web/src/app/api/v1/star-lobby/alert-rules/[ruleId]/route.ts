import { updateStarLobbyAlertRuleBodySchema } from "@yeon/api-contract/star-lobby";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import { getCurrentAuthUser } from "@/server/auth/session";
import {
  deleteStarLobbyAlertRuleInSpring,
  StarLobbySpringBackendHttpError,
  updateStarLobbyAlertRuleInSpring,
} from "@/server/star-lobby-spring-client";

export const runtime = "nodejs";

const GUEST_SESSION_ID_HEADER = "x-yeon-guest-session-id";
const GUEST_SESSION_ID_COOKIE = "yeon_star_lobby_guest_session_id";

function resolveGuestSessionId(request: NextRequest) {
  return (
    request.headers.get(GUEST_SESSION_ID_HEADER)?.trim() ||
    request.cookies.get(GUEST_SESSION_ID_COOKIE)?.value?.trim() ||
    null
  );
}

async function resolveOwner(request: NextRequest) {
  const user = await getCurrentAuthUser();
  return {
    userId: user?.id ?? null,
    guestSessionId: resolveGuestSessionId(request),
  };
}

type RouteContext = {
  params: Promise<{ ruleId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = updateStarLobbyAlertRuleBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ??
        "스타 로비 알림 조건 수정 요청이 올바르지 않습니다.",
      400
    );
  }

  const { ruleId } = await context.params;
  const owner = await resolveOwner(request);

  try {
    return NextResponse.json(
      await updateStarLobbyAlertRuleInSpring({
        ...owner,
        ruleId,
        payload: parsed.data,
      })
    );
  } catch (error) {
    if (error instanceof StarLobbySpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("스타 로비 알림 조건을 수정하지 못했습니다.", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { ruleId } = await context.params;
  const owner = await resolveOwner(request);

  try {
    await deleteStarLobbyAlertRuleInSpring({ ...owner, ruleId });
    return NextResponse.json({ deletedRuleId: ruleId });
  } catch (error) {
    if (error instanceof StarLobbySpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("스타 로비 알림 조건을 삭제하지 못했습니다.", 500);
  }
}
