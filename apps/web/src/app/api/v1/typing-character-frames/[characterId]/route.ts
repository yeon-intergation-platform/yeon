import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentAuthUser } from "@/server/auth/session";
import {
  TypingCharacterFramesSpringBackendHttpError,
  updateTypingCharacterFrameOverrideInSpring,
} from "@/server/typing-character-frames-spring-client";
import type { FrameSlot } from "@/features/typing-service/frame-slot";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const currentUser = await getCurrentAuthUser();
  if (!currentUser) {
    return NextResponse.json(
      { error: "관리자 권한이 필요합니다." },
      { status: 403 }
    );
  }

  const { characterId } = await params;

  let body: { frameSlots: FrameSlot[] | null };
  try {
    body = (await request.json()) as { frameSlots: FrameSlot[] | null };
  } catch {
    return NextResponse.json(
      { error: "요청 본문이 올바른 JSON 형식이 아닙니다." },
      { status: 400 }
    );
  }

  try {
    const result = await updateTypingCharacterFrameOverrideInSpring({
      userId: currentUser.id,
      characterId,
      frameSlots: body.frameSlots ?? null,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof TypingCharacterFramesSpringBackendHttpError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "프레임 오버라이드를 저장하지 못했습니다." },
      { status: 500 }
    );
  }
}
