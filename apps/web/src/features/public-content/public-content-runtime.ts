import type {
  PublicContentArticleDetailDto,
  PublicContentChannel,
} from "@yeon/api-contract/public-content";
import { loadPublicContentSnapshot } from "@/server/public-content-public-read";
import type {
  PublicContentArticle,
  PublicContentService,
} from "./public-content-data";
import { publicContentMarkdownToBlocks } from "./public-content-markdown";

export async function loadPublishedPublicContentArticles(
  channel?: PublicContentChannel
): Promise<PublicContentArticle[]> {
  const response = await loadPublicContentSnapshot(channel ? { channel } : {});
  return response.articles.map(toPublicContentArticle);
}

export function toPublicContentArticle(
  article: PublicContentArticleDetailDto
): PublicContentArticle {
  return {
    channel: article.channel,
    service: article.serviceKey as PublicContentService,
    category: article.category,
    slugSegments: article.slug.split("/").filter(Boolean),
    title: article.title,
    description: article.description,
    summary: article.summary,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    readingMinutes: article.readingMinutes,
    ctaLabel: article.ctaLabel ?? undefined,
    ctaHref: article.ctaHref ?? undefined,
    metaTitle: article.metaTitle ?? undefined,
    metaDescription: article.metaDescription ?? undefined,
    ogImageUrl: article.ogImageUrl ?? undefined,
    sourcePaths: [],
    body: publicContentMarkdownToBlocks(article.bodyMarkdown),
    bodyMarkdown: article.bodyMarkdown,
  };
}
