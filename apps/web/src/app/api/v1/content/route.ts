import { publicContentListQuerySchema } from "@yeon/api-contract/public-content";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  PublicContentSpringBackendHttpError,
  fetchPublicContentArticlesFromSpring,
} from "@/server/public-content-spring-client";
import { jsonPublicContentError } from "./_shared";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const parsedQuery = publicContentListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  );

  if (!parsedQuery.success) {
    return jsonPublicContentError(
      "공개 콘텐츠 목록 요청 형식이 올바르지 않습니다.",
      400
    );
  }

  try {
    return NextResponse.json(
      await fetchPublicContentArticlesFromSpring(parsedQuery.data)
    );
  } catch (error) {
    if (error instanceof PublicContentSpringBackendHttpError) {
      return jsonPublicContentError(error.message, error.status);
    }

    console.error(error);
    return jsonPublicContentError(
      "공개 콘텐츠 목록을 불러오지 못했습니다.",
      500
    );
  }
}
