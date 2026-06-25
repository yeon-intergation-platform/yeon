import { NextResponse } from "next/server";
import { gameSlugRequestSchema } from "@yeon/api-contract/game-library";
import { getCurrentAuthUser } from "@/server/auth/session";
import {
  GameLibraryRequestError,
  listFavorites,
  toggleFavorite,
} from "@/server/game-library-spring-client";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentAuthUser();
  if (!user) {
    return NextResponse.json({ slugs: [] });
  }
  try {
    const slugs = await listFavorites(user.id);
    return NextResponse.json({ slugs });
  } catch (error) {
    console.error("찜 목록 조회 실패", error);
    return NextResponse.json({ slugs: [] });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentAuthUser();
  if (!user) {
    return NextResponse.json(
      { message: "찜은 로그인 후 이용할 수 있습니다." },
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
  const parsed = gameSlugRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "gameSlug가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const favorited = await toggleFavorite(user.id, parsed.data.gameSlug);
    return NextResponse.json({ favorited });
  } catch (error) {
    if (error instanceof GameLibraryRequestError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    console.error("찜 토글 실패", error);
    return NextResponse.json(
      { message: "찜을 처리하지 못했습니다." },
      { status: 502 }
    );
  }
}
