import { NextResponse, type NextRequest } from "next/server";
import {
  PUBLIC_CONTENT_CHANNELS,
  getPublicContentArticleBySlug,
  type PublicContentChannel,
} from "@/features/public-content/public-content-data";
import { buildPublicContentOpsToolbarModel } from "@/features/public-content/public-content-ops-toolbar";
import { loadPublishedPublicContentArticles } from "@/features/public-content/public-content-runtime";
import { NOINDEX_X_ROBOTS_TAG_VALUE } from "@/lib/seo";
import { getCurrentAdminUser } from "@/server/auth/admin";

function isPublicContentChannel(value: string): value is PublicContentChannel {
  return Object.values(PUBLIC_CONTENT_CHANNELS).includes(
    value as PublicContentChannel
  );
}

function noContent() {
  return new NextResponse(null, {
    headers: {
      "X-Robots-Tag": NOINDEX_X_ROBOTS_TAG_VALUE,
    },
    status: 204,
  });
}

export async function GET(request: NextRequest) {
  const adminUser = await getCurrentAdminUser().catch(() => null);
  if (!adminUser) {
    return noContent();
  }

  const channel = request.nextUrl.searchParams.get("channel");
  const slug = request.nextUrl.searchParams.get("slug");

  if (!channel || !isPublicContentChannel(channel) || !slug) {
    return NextResponse.json(
      { message: "운영 확인 대상 글을 찾을 수 없습니다." },
      {
        headers: {
          "X-Robots-Tag": NOINDEX_X_ROBOTS_TAG_VALUE,
        },
        status: 400,
      }
    );
  }

  const articles = await loadPublishedPublicContentArticles(channel);
  const article = getPublicContentArticleBySlug(
    channel,
    slug.split("/"),
    articles
  );
  if (!article) {
    return NextResponse.json(
      { message: "운영 확인 대상 글을 찾을 수 없습니다." },
      {
        headers: {
          "X-Robots-Tag": NOINDEX_X_ROBOTS_TAG_VALUE,
        },
        status: 404,
      }
    );
  }

  return NextResponse.json(
    buildPublicContentOpsToolbarModel(article, { enabled: true }),
    {
      headers: {
        "X-Robots-Tag": NOINDEX_X_ROBOTS_TAG_VALUE,
      },
    }
  );
}
