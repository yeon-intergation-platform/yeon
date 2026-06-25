import { NextResponse } from "next/server";
import { getCurrentAuthUser } from "@/server/auth/session";
import { isAdminUser } from "@/server/auth/admin";
import {
  GameCommentRequestError,
  toggleCommentLike,
  type CommentViewer,
} from "@/server/game-comments-spring-client";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json(
      { message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }

  const user = await getCurrentAuthUser();
  if (!user) {
    return NextResponse.json(
      { message: "좋아요는 로그인 후 이용할 수 있습니다." },
      { status: 401 }
    );
  }
  const isAdmin = await isAdminUser(user).catch(() => false);
  const viewer: CommentViewer = {
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    isAdmin,
  };

  try {
    const result = await toggleCommentLike(id, viewer);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GameCommentRequestError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    console.error("댓글 좋아요 실패", error);
    return NextResponse.json(
      { message: "좋아요를 처리하지 못했습니다." },
      { status: 502 }
    );
  }
}
