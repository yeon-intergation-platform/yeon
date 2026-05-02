import { NextResponse } from "next/server";

import { listCharacterFrameOverrides } from "@/server/repositories/typing-character-frame-overrides-repository";

export const runtime = "nodejs";

export async function GET() {
  try {
    const overrides = await listCharacterFrameOverrides();
    return NextResponse.json({ overrides });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "프레임 오버라이드를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
