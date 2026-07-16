import {
  buildPublicContentInternalHref,
  getPublicContentArticles,
  getPublicContentChannelConfig,
  type PublicContentArticle,
  type PublicContentChannel,
} from "./public-content-data";

export type PublicContentNotFoundLink = {
  href: string;
  label: string;
};

function compareArticlesByDate(
  left: PublicContentArticle,
  right: PublicContentArticle
) {
  return right.publishedAt.localeCompare(left.publishedAt);
}

export function getPublicContentNotFoundHomeLink(
  channel: PublicContentChannel
): PublicContentNotFoundLink {
  const config = getPublicContentChannelConfig(channel);

  return {
    href: buildPublicContentInternalHref(channel),
    label: `${config.label} 홈으로 이동`,
  };
}

export function getPublicContentNotFoundArticles(
  channel: PublicContentChannel,
  limit = 3
): readonly PublicContentArticle[] {
  return getPublicContentArticles(channel)
    .sort(compareArticlesByDate)
    .slice(0, limit);
}
