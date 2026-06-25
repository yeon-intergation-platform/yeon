import { NextResponse } from "next/server";
import {
  GameCommentRequestError,
  revealGameComment,
} from "@/server/game-comments-spring-client";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
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

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body?.password === "string") password = body.password;
  } catch {
    return NextResponse.json(
      { message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }
  if (!password) {
    return NextResponse.json(
      { message: "비밀번호를 입력해 주세요." },
      { status: 400 }
    );
  }

  try {
    const content = await revealGameComment(id, password);
    return NextResponse.json({ content });
  } catch (error) {
    if (error instanceof GameCommentRequestError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    console.error("비밀댓글 확인 실패", error);
    return NextResponse.json(
      { message: "비밀댓글을 확인하지 못했습니다." },
      { status: 502 }
    );
  }
}
