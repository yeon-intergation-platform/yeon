import { NextResponse } from "next/server";
import { getCurrentAuthUser } from "@/server/auth/session";
import { isAdminUser } from "@/server/auth/admin";
import {
  deleteGameComment,
  GameCommentRequestError,
  type CommentViewer,
} from "@/server/game-comments-spring-client";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json(
      { message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }
  const password = new URL(request.url).searchParams.get("password");

  try {
    const viewer = await resolveViewer();
    await deleteGameComment(id, viewer, password);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof GameCommentRequestError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    console.error("게임 댓글 삭제 실패", error);
    return NextResponse.json(
      { message: "댓글을 삭제하지 못했습니다." },
      { status: 502 }
    );
  }
}
