import {
  getPublicContentArticles,
  type PublicContentArticle,
} from "./public-content-data";

function getArticleSlug(article: PublicContentArticle) {
  return article.slugSegments.join("/");
}

function compareArticlesByPublishedDate(
  left: PublicContentArticle,
  right: PublicContentArticle
) {
  return right.publishedAt.localeCompare(left.publishedAt);
}

export function getPublicContentRelatedArticles(
  article: PublicContentArticle,
  limit = 2
): readonly PublicContentArticle[] {
  const articleSlug = getArticleSlug(article);

  return getPublicContentArticles(article.channel)
    .filter(
      (candidate) =>
        candidate.service === article.service &&
        getArticleSlug(candidate) !== articleSlug
    )
    .sort(compareArticlesByPublishedDate)
    .slice(0, limit);
}
