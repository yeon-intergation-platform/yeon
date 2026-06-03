import type { NextRequest } from "next/server";
import { getCurrentAuthUser } from "@/server/auth/session";

const GUEST_SESSION_ID_HEADER = "x-yeon-guest-session-id";
const GUEST_SESSION_ID_COOKIE = "yeon_star_lobby_guest_session_id";

// 보안 참고: guestSessionId는 클라이언트가 완전히 통제하는 값이다.
// 타 게스트 session-id를 알아내면 그 게스트의 알림 규칙을 조회·수정할 수 있다.
// 장기적으로는 서버가 발급하는 HMAC 서명 쿠키로 위조를 방지해야 한다.
// 현재는 인증 사용자(userId 존재)에게 민감 작업을 우선 허용하고, 게스트는 낮은 권한으로만 허용하는 방어 깊이를 유지한다.
function resolveGuestSessionId(request: NextRequest): string | null {
  const value =
    request.headers.get(GUEST_SESSION_ID_HEADER)?.trim() ||
    request.cookies.get(GUEST_SESSION_ID_COOKIE)?.value?.trim() ||
    null;
  // 최소 길이 가드: 비어있거나 너무 짧은 식별자 거부
  if (!value || value.length < 8) return null;
  return value;
}

export async function resolveStarLobbyBffOwner(request: NextRequest) {
  const user = await getCurrentAuthUser();
  return {
    userId: user?.id ?? null,
    guestSessionId: resolveGuestSessionId(request),
  };
}
