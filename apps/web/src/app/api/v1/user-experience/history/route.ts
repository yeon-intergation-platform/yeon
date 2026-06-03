import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentAuthUser } from "@/server/auth/session";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import {
  getExperienceHistory,
  UserExperienceSpringBackendHttpError,
} from "@/server/user-experience-spring-client";

export const runtime = "nodejs";

function parseLimit(raw: string | null): number | undefined {
  if (!raw) {
    return undefined;
  }
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export async function GET(request: NextRequest) {
  // userId는 클라이언트가 위조하지 못하도록 서버 세션에서만 주입한다(IDOR 방지).
  const user = await getCurrentAuthUser();
  if (!user) {
    return jsonError("로그인이 필요합니다.", 401);
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));

  try {
    return NextResponse.json(await getExperienceHistory(user.id, limit));
  } catch (error) {
    if (error instanceof UserExperienceSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("경험치 이력을 불러오지 못했습니다.", 500);
  }
}
