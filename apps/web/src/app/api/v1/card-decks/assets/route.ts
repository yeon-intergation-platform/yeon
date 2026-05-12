import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import {
  CardDeckAssetsSpringBackendHttpError,
  uploadCardDeckAssetToSpring,
} from "@/server/card-deck-assets-spring-client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("이미지 업로드 요청을 읽지 못했습니다.", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonError("업로드할 이미지 파일이 필요합니다.", 400);
  }

  try {
    const uploaded = await uploadCardDeckAssetToSpring(file);
    return NextResponse.json(uploaded, { status: 201 });
  } catch (error) {
    if (error instanceof CardDeckAssetsSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("이미지를 업로드하지 못했습니다.", 500);
  }
}
