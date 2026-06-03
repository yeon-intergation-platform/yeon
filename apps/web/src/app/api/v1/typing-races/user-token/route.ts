import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { signTypingRaceUserToken } from "@/server/typing-race-seed";
import {
  getOptionalAuthenticatedUser,
  jsonError,
} from "../../typing-decks/_shared";

export const runtime = "nodejs";

// 타자 레이스 입장 시 race-server 가 검증할 로그인 사용자 토큰을 발급하는 전용 엔드포인트.
// 시드와 무관하게 모든 join 경로(create/quickRoom/joinById)에 균일하게 userId/userToken 을 공급한다.
// - 로그인: { userId, userToken } 발급(race-seed route 와 동일한 signTypingRaceUserToken).
// - 비로그인: { userId: null, userToken: null } → race-server 검증 불가 → 경험치 적립 없음(정상).
export async function GET(request: NextRequest) {
  try {
    const { currentUser } = await getOptionalAuthenticatedUser(request);
    if (!currentUser?.id) {
      return NextResponse.json({ userId: null, userToken: null });
    }
    return NextResponse.json({
      userId: currentUser.id,
      userToken: signTypingRaceUserToken(currentUser.id),
    });
  } catch (error) {
    console.error(error);
    return jsonError("타자 레이스 사용자 토큰을 발급하지 못했습니다.", 500);
  }
}
