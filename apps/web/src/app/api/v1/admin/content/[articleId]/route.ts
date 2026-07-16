import { updatePublicContentArticleBodySchema } from "@yeon/api-contract/public-content";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  PublicContentSpringBackendHttpError,
  deleteAdminPublicContentArticleInSpring,
  fetchAdminPublicContentArticleFromSpring,
  updateAdminPublicContentArticleInSpring,
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

export async function PATCH(
  request: NextRequest,
  { params }: AdminPublicContentArticleRouteParams
) {
  const auth = await requireAdminPublicContentAuthenticatedUser(request);
  if (!auth.currentUser) return auth.response;

  const { articleId: rawArticleId } = await params;
  const articleId = parseAdminPublicContentArticleId(rawArticleId);
  const parsedBody = updatePublicContentArticleBodySchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!articleId || !parsedBody.success) {
    return jsonAdminPublicContentError(
      "공개 콘텐츠 글 입력값을 확인해 주세요.",
      400
    );
  }

  try {
    return NextResponse.json(
      await updateAdminPublicContentArticleInSpring({
        userId: auth.currentUser.id,
        articleId,
        body: parsedBody.data,
      })
    );
  } catch (error) {
    if (error instanceof PublicContentSpringBackendHttpError) {
      return jsonAdminPublicContentError(error.message, error.status);
    }
    console.error(error);
    return jsonAdminPublicContentError(
      "공개 콘텐츠 글을 저장하지 못했습니다.",
      500
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: AdminPublicContentArticleRouteParams
) {
  const auth = await requireAdminPublicContentAuthenticatedUser(request);
  if (!auth.currentUser) return auth.response;

  const { articleId: rawArticleId } = await params;
  const articleId = parseAdminPublicContentArticleId(rawArticleId);
  const version = Number(request.nextUrl.searchParams.get("version"));
  if (!articleId || !Number.isInteger(version) || version < 1) {
    return jsonAdminPublicContentError(
      "삭제할 글의 version을 확인해 주세요.",
      400
    );
  }

  try {
    await deleteAdminPublicContentArticleInSpring({
      userId: auth.currentUser.id,
      articleId,
      version,
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof PublicContentSpringBackendHttpError) {
      return jsonAdminPublicContentError(error.message, error.status);
    }
    console.error(error);
    return jsonAdminPublicContentError(
      "공개 콘텐츠 초안을 삭제하지 못했습니다.",
      500
    );
  }
}
