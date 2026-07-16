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
    ...(article.channel === "support"
      ? []
      : [formatPublicContentDisplayDate(article.publishedAt)]),
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
    formatPublicContentDisplayDate(article.publishedAt).replaceAll("-", "."),
    `${article.readingMinutes}분 읽기`,
  ];
}

export function formatPublicContentDisplayDate(value: string) {
  return value.split("T", 1)[0] ?? value;
}
