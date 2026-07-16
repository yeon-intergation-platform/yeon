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
    ...(article.channel === "support" ? [] : [article.publishedAt]),
    `${article.readingMinutes}분`,
  ];
}

export function getPublicContentArticleCardClassificationItems(
  article: PublicContentArticle
) {
  return [
    getPublicContentServiceLabel(article.service),
    getPublicContentCategoryLabel(article.category),
  ];
}

export function getPublicContentArticleCardPublicationItems(
  article: PublicContentArticle
) {
  if (article.channel === "support") {
    return [`${article.readingMinutes}분 읽기`];
  }

  return [
    article.publishedAt.replaceAll("-", "."),
    `${article.readingMinutes}분 읽기`,
  ];
}
