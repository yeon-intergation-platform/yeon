import type {
  PublicContentArticleDetailDto,
  PublicContentArticleListResponse,
  PublicContentArticleResponse,
  PublicContentArticleSummaryDto,
  PublicContentChannel,
  PublicContentListQuery,
  PublicContentSitemapResponse,
  PublicContentSnapshotResponse,
} from "@yeon/api-contract/public-content";
import { publicContentCategorySchema } from "@yeon/api-contract/public-content";
import {
  PUBLIC_CONTENT_ARTICLES,
  getPublicContentChannelConfig,
  type PublicContentArticle,
} from "@/features/public-content/public-content-data";
import { publicContentBlocksToMarkdown } from "@/features/public-content/public-content-markdown";
import {
  PublicContentSpringBackendHttpError,
  fetchPublicContentArticleFromSpring,
  fetchPublicContentArticlesFromSpring,
  fetchPublicContentRedirectFromSpring,
  fetchPublicContentSitemapFromSpring,
  fetchPublicContentSnapshotFromSpring,
} from "@/server/public-content-spring-client";

function toIsoDate(value: string) {
  return value.includes("T") ? value : `${value}T00:00:00.000Z`;
}

function toStaticDetail(
  article: PublicContentArticle
): PublicContentArticleDetailDto {
  return {
    channel: article.channel,
    serviceKey: article.service,
    category: publicContentCategorySchema.parse(article.category),
    slug: article.slugSegments.join("/"),
    title: article.title,
    description: article.description,
    summary: article.summary,
    canonicalUrl: `${getPublicContentChannelConfig(article.channel).host}/${article.slugSegments.join("/")}`,
    publishedAt: toIsoDate(article.publishedAt),
    updatedAt: toIsoDate(article.updatedAt),
    readingMinutes: article.readingMinutes,
    bodyFormat: "markdown",
    bodyMarkdown:
      article.bodyMarkdown ?? publicContentBlocksToMarkdown(article.body),
    ctaLabel: article.ctaLabel ?? null,
    ctaHref: article.ctaHref ?? null,
    metaTitle: article.metaTitle ?? null,
    metaDescription: article.metaDescription ?? null,
    ogImageUrl: article.ogImageUrl ?? null,
  };
}

function staticDetails(query: PublicContentListQuery = {}) {
  return PUBLIC_CONTENT_ARTICLES.filter(
    (article) =>
      (!query.channel || article.channel === query.channel) &&
      (!query.serviceKey || article.service === query.serviceKey) &&
      (!query.category || article.category === query.category)
  ).map(toStaticDetail);
}

function toStaticSummary(
  article: PublicContentArticleDetailDto
): PublicContentArticleSummaryDto {
  return {
    channel: article.channel,
    serviceKey: article.serviceKey,
    category: article.category,
    slug: article.slug,
    title: article.title,
    description: article.description,
    summary: article.summary,
    canonicalUrl: article.canonicalUrl,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    readingMinutes: article.readingMinutes,
  };
}

function logFallback(scope: string, error: unknown) {
  console.error(
    `공개 콘텐츠 ${scope}을(를) Spring에서 불러오지 못해 내장 초기 데이터를 사용합니다.`,
    error
  );
}

function shouldPreserveNotFound(error: unknown) {
  return (
    error instanceof PublicContentSpringBackendHttpError && error.status === 404
  );
}

export async function loadPublicContentList(
  query: PublicContentListQuery = {}
): Promise<PublicContentArticleListResponse> {
  try {
    return await fetchPublicContentArticlesFromSpring(query);
  } catch (error) {
    logFallback("목록", error);
    return {
      articles: staticDetails(query).map(toStaticSummary),
    };
  }
}

export async function loadPublicContentSnapshot(
  query: PublicContentListQuery = {}
): Promise<PublicContentSnapshotResponse> {
  try {
    return await fetchPublicContentSnapshotFromSpring(query);
  } catch (error) {
    logFallback("발행본", error);
    return { articles: staticDetails(query) };
  }
}

export async function loadPublicContentArticle(params: {
  channel: PublicContentChannel;
  slug: string;
}): Promise<PublicContentArticleResponse> {
  try {
    return await fetchPublicContentArticleFromSpring(params);
  } catch (error) {
    if (shouldPreserveNotFound(error)) throw error;
    const article = staticDetails({ channel: params.channel }).find(
      (candidate) => candidate.slug === params.slug
    );
    if (!article) throw error;
    logFallback("글", error);
    return { article };
  }
}

export async function loadPublicContentArchivedRedirect(params: {
  channel: PublicContentChannel;
  slug: string;
}): Promise<string | null> {
  try {
    const response = await fetchPublicContentRedirectFromSpring(params);
    return response.redirectTo;
  } catch (error) {
    if (shouldPreserveNotFound(error)) return null;
    throw error;
  }
}

export async function loadPublicContentSitemap(
  channel: PublicContentChannel
): Promise<PublicContentSitemapResponse> {
  try {
    return await fetchPublicContentSitemapFromSpring(channel);
  } catch (error) {
    logFallback("sitemap", error);
    const articles = staticDetails({ channel });
    const lastModified =
      articles
        .map((article) => article.updatedAt)
        .sort()
        .at(-1) ?? "2026-06-17T00:00:00.000Z";
    return {
      entries: [
        {
          url: getPublicContentChannelConfig(channel).host,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.7,
        },
        ...articles.map((article) => ({
          url: article.canonicalUrl,
          lastModified: article.updatedAt,
          changeFrequency:
            channel === "support" ? ("monthly" as const) : ("weekly" as const),
          priority: channel === "support" ? 0.65 : 0.55,
        })),
      ],
    };
  }
}
