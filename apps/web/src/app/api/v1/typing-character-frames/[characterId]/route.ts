import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getCurrentAdminUser } from "@/server/auth/admin";
import {
  deleteCharacterFrameOverride,
  upsertCharacterFrameOverride,
} from "@/server/repositories/typing-character-frame-overrides-repository";
import type { FrameSlot } from "@/features/typing-service/frame-slot";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) {
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
    if (!body.frameSlots || body.frameSlots.length === 0) {
      await deleteCharacterFrameOverride(characterId);
      return NextResponse.json({ override: null });
    }

    const override = await upsertCharacterFrameOverride(
      characterId,
      body.frameSlots,
      admin.id
    );
    return NextResponse.json({ override });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "프레임 오버라이드를 저장하지 못했습니다." },
      { status: 500 }
    );
  }
}
