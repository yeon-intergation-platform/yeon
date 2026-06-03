import { NextResponse } from "next/server";
import {
  TypingCharacterFramesSpringBackendHttpError,
  fetchTypingCharacterFrameOverridesFromSpring,
} from "@/server/typing-character-frames-spring-client";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(
      await fetchTypingCharacterFrameOverridesFromSpring()
    );
  } catch (error) {
    if (error instanceof TypingCharacterFramesSpringBackendHttpError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "프레임 오버라이드를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
