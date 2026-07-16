import { transitionPublicContentArticleBodySchema } from "@yeon/api-contract/public-content";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  PublicContentSpringBackendHttpError,
  PUBLIC_CONTENT_SNAPSHOT_CACHE_TAG,
  transitionAdminPublicContentArticleInSpring,
} from "@/server/public-content-spring-client";
import {
  jsonAdminPublicContentError,
  parseAdminPublicContentArticleId,
  requireAdminPublicContentAuthenticatedUser,
} from "../../_shared";

export const runtime = "nodejs";

const ACTIONS = new Set(["review", "publish", "archive", "restore"] as const);
type PublicContentAction = "review" | "publish" | "archive" | "restore";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string; action: string }> }
) {
  const auth = await requireAdminPublicContentAuthenticatedUser(request);
  if (!auth.currentUser) return auth.response;

  const { articleId: rawArticleId, action: rawAction } = await params;
  const articleId = parseAdminPublicContentArticleId(rawArticleId);
  const action = ACTIONS.has(rawAction as PublicContentAction)
    ? (rawAction as PublicContentAction)
    : null;
  const parsedBody = transitionPublicContentArticleBodySchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!articleId || !action || !parsedBody.success) {
    return jsonAdminPublicContentError(
      "글 상태 변경 요청을 확인해 주세요.",
      400
    );
  }

  try {
    const response = await transitionAdminPublicContentArticleInSpring({
      userId: auth.currentUser.id,
      articleId,
      action,
      body: parsedBody.data,
    });
    if (action === "publish" || action === "archive") {
      try {
        revalidateTag(PUBLIC_CONTENT_SNAPSHOT_CACHE_TAG, { expire: 0 });
      } catch (cacheError) {
        console.error(
          "공개 콘텐츠 상태는 변경됐지만 snapshot cache를 즉시 비우지 못했습니다.",
          cacheError
        );
      }
    }
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof PublicContentSpringBackendHttpError) {
      return jsonAdminPublicContentError(error.message, error.status);
    }
    console.error(error);
    return jsonAdminPublicContentError("글 상태를 변경하지 못했습니다.", 500);
  }
}
