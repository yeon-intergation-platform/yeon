import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import {
  uploadCardDeckImage,
  validateCardDeckImageFile,
} from "@/server/services/card-deck-image-storage";
import { ServiceError } from "@/server/services/service-error";

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
    validateCardDeckImageFile(file);
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadCardDeckImage({
      buffer,
      mimeType: file.type,
    });
    return NextResponse.json(uploaded, { status: 201 });
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("이미지를 업로드하지 못했습니다.", 500);
  }
}
