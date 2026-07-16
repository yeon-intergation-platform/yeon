import {
  createPublicContentArticleBodySchema,
  publicContentAdminListQuerySchema,
} from "@yeon/api-contract/public-content";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  PublicContentSpringBackendHttpError,
  createAdminPublicContentArticleInSpring,
  fetchAdminPublicContentArticlesFromSpring,
} from "@/server/public-content-spring-client";
import {
  jsonAdminPublicContentError,
  requireAdminPublicContentAuthenticatedUser,
} from "./_shared";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdminPublicContentAuthenticatedUser(request);

  if (!auth.currentUser) {
    return auth.response;
  }

  const parsedQuery = publicContentAdminListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  );

  if (!parsedQuery.success) {
    return jsonAdminPublicContentError(
      "관리자 공개 콘텐츠 목록 요청 형식이 올바르지 않습니다.",
      400
    );
  }

  try {
    return NextResponse.json(
      await fetchAdminPublicContentArticlesFromSpring({
        userId: auth.currentUser.id,
        query: parsedQuery.data,
      })
    );
  } catch (error) {
    if (error instanceof PublicContentSpringBackendHttpError) {
      return jsonAdminPublicContentError(error.message, error.status);
    }

    console.error(error);
    return jsonAdminPublicContentError(
      "관리자 공개 콘텐츠 목록을 불러오지 못했습니다.",
      500
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminPublicContentAuthenticatedUser(request);

  if (!auth.currentUser) {
    return auth.response;
  }

  const parsedBody = createPublicContentArticleBodySchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsedBody.success) {
    return jsonAdminPublicContentError(
      "새 공개 콘텐츠 글 입력값을 확인해 주세요.",
      400
    );
  }

  try {
    return NextResponse.json(
      await createAdminPublicContentArticleInSpring({
        userId: auth.currentUser.id,
        body: parsedBody.data,
      }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof PublicContentSpringBackendHttpError) {
      return jsonAdminPublicContentError(error.message, error.status);
    }

    console.error(error);
    return jsonAdminPublicContentError(
      "새 공개 콘텐츠 글을 만들지 못했습니다.",
      500
    );
  }
}
