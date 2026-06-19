import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  isYeonFile,
  type YeonFormData,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import {
  CardDeckAssetsSpringBackendHttpError,
  uploadCardDeckAssetToSpring,
} from "@/server/card-deck-assets-spring-client";

export const runtime = "nodejs";

// 허용 MIME 타입 — SVG는 스크립트 실행 위험으로 제외
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

// 참고: 이 엔드포인트는 게스트/로그인 무관 업로드가 설계 의도(asset-upload.ts 주석).
// 인증 가드 대신 파일 크기·MIME 화이트리스트 검증으로 남용 완화.
export async function POST(request: NextRequest) {
  let formData: YeonFormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("이미지 업로드 요청을 읽지 못했습니다.", 400);
  }

  const file = formData.get("file");
  if (!isYeonFile(file)) {
    return jsonError("업로드할 이미지 파일이 필요합니다.", 400);
  }

  if (file.size > MAX_FILE_BYTES) {
    return jsonError("이미지 파일 크기는 5MB 이하여야 합니다.", 400);
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return jsonError(
      "PNG, JPEG, WebP, GIF 형식의 이미지만 업로드할 수 있습니다.",
      400
    );
  }

  try {
    const uploaded = await uploadCardDeckAssetToSpring(file);
    return NextResponse.json(uploaded, { status: 201 });
  } catch (error) {
    if (error instanceof CardDeckAssetsSpringBackendHttpError) {
      return jsonError(error.message, error.status, { code: error.code });
    }
    console.error(error);
    return jsonError("이미지를 업로드하지 못했습니다.", 500);
  }
}
