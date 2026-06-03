import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/server/auth/admin";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import {
  adminListUserCardDecks,
  UserExperienceSpringBackendHttpError,
} from "@/server/user-experience-spring-client";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  // 관리자 가드: 서버 세션 + role 검증 후에만 admin id를 주입한다.
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return jsonError("관리자 권한이 필요합니다.", 403);
  }

  const { userId } = await params;

  try {
    return NextResponse.json(await adminListUserCardDecks(admin.id, userId));
  } catch (error) {
    if (error instanceof UserExperienceSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("사용자 카드덱을 불러오지 못했습니다.", 500);
  }
}
