import {
  publicContentChannelSchema,
  publicContentSlugSchema,
} from "@yeon/api-contract/public-content";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PublicContentSpringBackendHttpError } from "@/server/public-content-spring-client";
import { loadPublicContentArticle } from "@/server/public-content-public-read";
import { jsonPublicContentError } from "../../_shared";

export const runtime = "nodejs";

type PublicContentArticleRouteParams = {
  params: Promise<{
    channel: string;
    slug: string[];
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: PublicContentArticleRouteParams
) {
  const { channel, slug } = await params;
  const parsedChannel = publicContentChannelSchema.safeParse(channel);
  const parsedSlug = publicContentSlugSchema.safeParse(slug.join("/"));

  if (!parsedChannel.success || !parsedSlug.success) {
    return jsonPublicContentError(
      "공개 콘텐츠 글 경로가 올바르지 않습니다.",
      400
    );
  }

  try {
    return NextResponse.json(
      await loadPublicContentArticle({
        channel: parsedChannel.data,
        slug: parsedSlug.data,
      })
    );
  } catch (error) {
    if (error instanceof PublicContentSpringBackendHttpError) {
      return jsonPublicContentError(error.message, error.status);
    }

    console.error(error);
    return jsonPublicContentError("공개 콘텐츠 글을 불러오지 못했습니다.", 500);
  }
}
