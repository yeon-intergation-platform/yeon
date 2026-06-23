import { NextResponse } from "next/server";
import { getCurrentAuthUser } from "@/server/auth/session";
import { awardGamePlayExperience } from "@/server/game-experience-spring-client";

export const runtime = "nodejs";

// slug 형식만 허용한다(referenceId 안전 + 임의 입력 차단). curated·feed slug 모두 이 형식.
const GAME_SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;

// 게임 플레이 시 경험치를 적립한다. userId는 서버 세션에서만 주입(위조 차단),
// 게임당 하루 1회 멱등 적립은 백엔드가 referenceId로 보장한다.
export async function POST(request: Request) {
  const user = await getCurrentAuthUser();
  // 비로그인/게스트는 적립 대상이 아니므로 조용히 무시한다.
  if (!user) {
    return new NextResponse(null, { status: 204 });
  }

  let gameSlug = "";
  try {
    const body = (await request.json()) as { gameSlug?: unknown };
    if (typeof body?.gameSlug === "string") {
      gameSlug = body.gameSlug;
    }
  } catch {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!GAME_SLUG_PATTERN.test(gameSlug)) {
    return NextResponse.json(
      { message: "gameSlug가 필요합니다." },
      { status: 400 }
    );
  }

  // 적립 실패는 플레이 경험을 막지 않는다(fire-and-forget 성격).
  const dateKey = new Date().toISOString().slice(0, 10);
  try {
    await awardGamePlayExperience(user.id, gameSlug, dateKey);
  } catch (error) {
    console.error("게임 경험치 적립 실패", error);
  }

  return new NextResponse(null, { status: 204 });
}
