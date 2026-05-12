import type { NextRequest } from "next/server";
import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  LocalImportAnalysisSpringBackendHttpError,
  runLocalImportAnalyzeInSpring,
} from "@/server/local-import-analysis-spring-client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("multipart form 데이터를 읽을 수 없습니다.", 400);
  }

  try {
    return await runLocalImportAnalyzeInSpring({
      userId: currentUser.id,
      formData,
      accept: request.headers.get("accept"),
    });
  } catch (error) {
    if (error instanceof LocalImportAnalysisSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("파일 분석에 실패했습니다.", 500);
  }
}
