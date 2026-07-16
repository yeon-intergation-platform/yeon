import {
  publicContentChannelSchema,
  publicContentSlugSchema,
} from "@yeon/api-contract/public-content";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PublicContentSpringBackendHttpError } from "@/server/public-content-spring-client";
import { loadPublicContentArchivedRedirect } from "@/server/public-content-public-read";
import { jsonPublicContentError } from "../../_shared";

export const runtime = "nodejs";

type PublicContentRedirectRouteParams = {
  params: Promise<{ channel: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: PublicContentRedirectRouteParams
) {
  const { channel } = await params;
  const parsedChannel = publicContentChannelSchema.safeParse(channel);
  const parsedSlug = publicContentSlugSchema.safeParse(
    request.nextUrl.searchParams.get("slug")
  );

  if (!parsedChannel.success || !parsedSlug.success) {
    return jsonPublicContentError(
      "공개 콘텐츠 redirect 경로가 올바르지 않습니다.",
      400
    );
  }

  try {
    const redirectTo = await loadPublicContentArchivedRedirect({
      channel: parsedChannel.data,
      slug: parsedSlug.data,
    });
    if (!redirectTo) {
      return jsonPublicContentError(
        "보관된 공개 콘텐츠 redirect를 찾을 수 없습니다.",
        404
      );
    }

    return NextResponse.json({ redirectTo });
  } catch (error) {
    if (error instanceof PublicContentSpringBackendHttpError) {
      return jsonPublicContentError(error.message, error.status);
    }
    console.error(error);
    return jsonPublicContentError(
      "공개 콘텐츠 redirect를 불러오지 못했습니다.",
      500
    );
  }
}
