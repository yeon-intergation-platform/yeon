import { publicContentListQuerySchema } from "@yeon/api-contract/public-content";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { loadPublicContentSnapshot } from "@/server/public-content-public-read";
import { jsonPublicContentError } from "../_shared";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const parsedQuery = publicContentListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  );
  if (!parsedQuery.success) {
    return jsonPublicContentError(
      "공개 콘텐츠 발행본 요청 형식이 올바르지 않습니다.",
      400
    );
  }

  try {
    return NextResponse.json(await loadPublicContentSnapshot(parsedQuery.data));
  } catch (error) {
    console.error(error);
    return jsonPublicContentError(
      "공개 콘텐츠 발행본을 불러오지 못했습니다.",
      500
    );
  }
}
