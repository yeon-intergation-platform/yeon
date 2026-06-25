import { NextResponse } from "next/server";
import { toggleGameLikeRequestSchema } from "@yeon/api-contract/game-like";
import { getCurrentAuthUser } from "@/server/auth/session";
import {
  GameLikeRequestError,
  getLikeStatus,
  toggleLike,
} from "@/server/game-likes-spring-client";

export const runtime = "nodejs";

const GAME_SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;

export async function GET(request: Request) {
  const gameSlug = new URL(request.url).searchParams.get("gameSlug") ?? "";
  if (!GAME_SLUG_PATTERN.test(gameSlug)) {
    return NextResponse.json(
      { message: "gameSlug가 필요합니다." },
      { status: 400 }
    );
  }
  try {
    const user = await getCurrentAuthUser();
    const status = await getLikeStatus(gameSlug, user?.id ?? null);
    return NextResponse.json(status);
  } catch (error) {
    console.error("좋아요 조회 실패", error);
    return NextResponse.json(
      { message: "좋아요 정보를 불러오지 못했습니다." },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getCurrentAuthUser();
  if (!user) {
    return NextResponse.json(
      { message: "좋아요는 로그인 후 이용할 수 있습니다." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }
  const parsed = toggleGameLikeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "gameSlug가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const status = await toggleLike(parsed.data.gameSlug, user.id);
    return NextResponse.json(status);
  } catch (error) {
    if (error instanceof GameLikeRequestError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    console.error("좋아요 토글 실패", error);
    return NextResponse.json(
      { message: "좋아요를 처리하지 못했습니다." },
      { status: 502 }
    );
  }
}
