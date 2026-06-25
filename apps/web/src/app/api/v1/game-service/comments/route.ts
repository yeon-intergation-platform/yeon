import { NextResponse } from "next/server";
import { createGameCommentRequestSchema } from "@yeon/api-contract/game-comment";
import { getCurrentAuthUser } from "@/server/auth/session";
import { isAdminUser } from "@/server/auth/admin";
import {
  createGameComment,
  GameCommentRequestError,
  listGameComments,
  type CommentViewer,
} from "@/server/game-comments-spring-client";

export const runtime = "nodejs";

const GAME_SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;

// 로그인 사용자 정체성은 서버 세션에서만 해석한다(클라이언트 위조 차단).
async function resolveViewer(): Promise<CommentViewer | null> {
  const user = await getCurrentAuthUser();
  if (!user) return null;
  const isAdmin = await isAdminUser(user).catch(() => false);
  return {
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    isAdmin,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const gameSlug = url.searchParams.get("gameSlug") ?? "";
  if (!GAME_SLUG_PATTERN.test(gameSlug)) {
    return NextResponse.json(
      { message: "gameSlug가 필요합니다." },
      { status: 400 }
    );
  }
  const sort =
    url.searchParams.get("sort") === "popular" ? "popular" : "latest";
  try {
    const viewer = await resolveViewer();
    const result = await listGameComments(gameSlug, viewer, sort);
    return NextResponse.json(result);
  } catch (error) {
    console.error("게임 댓글 조회 실패", error);
    return NextResponse.json(
      { message: "댓글을 불러오지 못했습니다." },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }

  const parsed = createGameCommentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "입력값을 확인해 주세요." },
      { status: 400 }
    );
  }

  try {
    const viewer = await resolveViewer();
    if (!viewer) {
      // 게스트는 닉네임+비밀번호가 반드시 필요하다.
      if (!parsed.data.guestNickname || !parsed.data.guestPassword) {
        return NextResponse.json(
          { message: "닉네임과 비밀번호를 입력해 주세요." },
          { status: 400 }
        );
      }
    }
    const comment = await createGameComment(parsed.data, viewer);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof GameCommentRequestError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    console.error("게임 댓글 작성 실패", error);
    return NextResponse.json(
      { message: "댓글을 등록하지 못했습니다." },
      { status: 502 }
    );
  }
}
