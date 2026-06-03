import { NextResponse } from "next/server";
import { getCurrentAuthUser } from "@/server/auth/session";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import {
  getUserExperience,
  UserExperienceSpringBackendHttpError,
} from "@/server/user-experience-spring-client";

export const runtime = "nodejs";

export async function GET() {
  // userId는 클라이언트가 위조하지 못하도록 서버 세션에서만 주입한다(IDOR 방지).
  const user = await getCurrentAuthUser();
  if (!user) {
    return jsonError("로그인이 필요합니다.", 401);
  }

  try {
    return NextResponse.json(await getUserExperience(user.id));
  } catch (error) {
    if (error instanceof UserExperienceSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("경험치 정보를 불러오지 못했습니다.", 500);
  }
}
