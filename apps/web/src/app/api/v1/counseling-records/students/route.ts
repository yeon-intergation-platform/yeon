import { listStudentSummariesResponseSchema } from "@yeon/api-contract/counseling-records";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { fetchCounselingRecordStudentsFromSpring, CounselingRecordStudentsSpringBackendHttpError } from "@/server/counseling-record-students-spring-client";

import { jsonError, requireAuthenticatedUser } from "../_shared";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);

  if (!currentUser) {
    return response;
  }

  try {
    const payload = await fetchCounselingRecordStudentsFromSpring(currentUser.id);
    return NextResponse.json(listStudentSummariesResponseSchema.parse(payload));
  } catch (error) {
    if (error instanceof CounselingRecordStudentsSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }

    console.error(error);
    return jsonError("학생별 요약을 불러오지 못했습니다.", 500);
  }
}
