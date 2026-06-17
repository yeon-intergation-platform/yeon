import {
  getPublicContentCategoryLabel,
  getPublicContentServiceLabel,
  type PublicContentArticle,
} from "./public-content-data";

export function getPublicContentArticleCardMetaItems(
  article: PublicContentArticle
) {
  return [
    getPublicContentServiceLabel(article.service),
    getPublicContentCategoryLabel(article.category),
    article.publishedAt,
    `${article.readingMinutes}분`,
  ];
}
