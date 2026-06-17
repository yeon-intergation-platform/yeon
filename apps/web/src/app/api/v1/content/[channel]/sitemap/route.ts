import { publicContentChannelSchema } from "@yeon/api-contract/public-content";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  PublicContentSpringBackendHttpError,
  fetchPublicContentSitemapFromSpring,
} from "@/server/public-content-spring-client";
import { jsonPublicContentError } from "../../_shared";

export const runtime = "nodejs";

type PublicContentSitemapRouteParams = {
  params: Promise<{
    channel: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: PublicContentSitemapRouteParams
) {
  const { channel } = await params;
  const parsedChannel = publicContentChannelSchema.safeParse(channel);

  if (!parsedChannel.success) {
    return jsonPublicContentError(
      "공개 콘텐츠 채널 경로가 올바르지 않습니다.",
      400
    );
  }

  try {
    return NextResponse.json(
      await fetchPublicContentSitemapFromSpring(parsedChannel.data)
    );
  } catch (error) {
    if (error instanceof PublicContentSpringBackendHttpError) {
      return jsonPublicContentError(error.message, error.status);
    }

    console.error(error);
    return jsonPublicContentError(
      "공개 콘텐츠 sitemap을 불러오지 못했습니다.",
      500
    );
  }
}
