import type { NextRequest } from "next/server";
import { getCurrentAuthUser } from "@/server/auth/session";

const GUEST_SESSION_ID_HEADER = "x-yeon-guest-session-id";
const GUEST_SESSION_ID_COOKIE = "yeon_star_lobby_guest_session_id";

function resolveGuestSessionId(request: NextRequest) {
  return (
    request.headers.get(GUEST_SESSION_ID_HEADER)?.trim() ||
    request.cookies.get(GUEST_SESSION_ID_COOKIE)?.value?.trim() ||
    null
  );
}

export async function resolveStarLobbyBffOwner(request: NextRequest) {
  const user = await getCurrentAuthUser();
  return {
    userId: user?.id ?? null,
    guestSessionId: resolveGuestSessionId(request),
  };
}
