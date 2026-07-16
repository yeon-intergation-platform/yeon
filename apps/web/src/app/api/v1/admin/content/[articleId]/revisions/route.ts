import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  PublicContentSpringBackendHttpError,
  fetchAdminPublicContentRevisionsFromSpring,
} from "@/server/public-content-spring-client";
import {
  jsonAdminPublicContentError,
  parseAdminPublicContentArticleId,
  requireAdminPublicContentAuthenticatedUser,
} from "../../_shared";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  const auth = await requireAdminPublicContentAuthenticatedUser(request);
  if (!auth.currentUser) return auth.response;

  const articleId = parseAdminPublicContentArticleId((await params).articleId);
  if (!articleId) {
    return jsonAdminPublicContentError(
      "발행 이력을 확인할 글이 올바르지 않습니다.",
      400
    );
  }

  try {
    return NextResponse.json(
      await fetchAdminPublicContentRevisionsFromSpring({
        userId: auth.currentUser.id,
        articleId,
      })
    );
  } catch (error) {
    if (error instanceof PublicContentSpringBackendHttpError) {
      return jsonAdminPublicContentError(error.message, error.status);
    }
    console.error(error);
    return jsonAdminPublicContentError("발행 이력을 불러오지 못했습니다.", 500);
  }
}
