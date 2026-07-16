import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import {
  buildPublicContentCanonicalUrl,
  buildPublicContentOpenGraphImageUrl,
  getPublicContentChannelConfig,
  type PublicContentArticle,
} from "./public-content-data";

export function buildPublicContentArticleMetadata(
  article: PublicContentArticle
): YeonPageMetadata {
  const config = getPublicContentChannelConfig(article.channel);
  const canonical = buildPublicContentCanonicalUrl(
    article.channel,
    article.slugSegments
  );
  const imageUrl =
    article.ogImageUrl ?? buildPublicContentOpenGraphImageUrl(article.channel);
  const metadataTitle = article.metaTitle ?? article.title;
  const metadataDescription = article.metaDescription ?? article.description;

  return {
    title: article.metaTitle
      ? article.metaTitle
      : `${article.title} | ${config.title}`,
    description: metadataDescription,
    alternates: { canonical },
    openGraph: {
      title: metadataTitle,
      description: metadataDescription,
      siteName: config.title,
      type: "article",
      url: canonical,
      locale: "ko_KR",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: metadataTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metadataTitle,
      description: metadataDescription,
      images: [imageUrl],
    },
  };
}
