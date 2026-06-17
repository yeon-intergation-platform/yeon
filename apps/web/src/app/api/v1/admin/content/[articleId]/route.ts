import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  PublicContentSpringBackendHttpError,
  fetchAdminPublicContentArticleFromSpring,
} from "@/server/public-content-spring-client";
import {
  jsonAdminPublicContentError,
  parseAdminPublicContentArticleId,
  requireAdminPublicContentAuthenticatedUser,
} from "../_shared";

export const runtime = "nodejs";

type AdminPublicContentArticleRouteParams = {
  params: Promise<{
    articleId: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: AdminPublicContentArticleRouteParams
) {
  const auth = await requireAdminPublicContentAuthenticatedUser(request);

  if (!auth.currentUser) {
    return auth.response;
  }

  const { articleId: rawArticleId } = await params;
  const articleId = parseAdminPublicContentArticleId(rawArticleId);

  if (!articleId) {
    return jsonAdminPublicContentError(
      "관리 대상 공개 콘텐츠 articleId가 올바르지 않습니다.",
      400
    );
  }

  try {
    return NextResponse.json(
      await fetchAdminPublicContentArticleFromSpring({
        userId: auth.currentUser.id,
        articleId,
      })
    );
  } catch (error) {
    if (error instanceof PublicContentSpringBackendHttpError) {
      return jsonAdminPublicContentError(error.message, error.status);
    }

    console.error(error);
    return jsonAdminPublicContentError(
      "관리자 공개 콘텐츠 글을 불러오지 못했습니다.",
      500
    );
  }
}
