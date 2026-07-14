import {
  PUBLIC_CONTENT_CHANNELS,
  buildPublicContentCanonicalUrl,
  getPublicContentArticles,
  type PublicContentArticle,
} from "./public-content-data";

export type PublicContentBlogDetailSourceLink = {
  href: string;
  label: string;
};

export type PublicContentBlogDetailRelatedLink = {
  href: string;
  title: string;
};

export type PublicContentBlogDetailModel = {
  authorDescription: string;
  authorName: string;
  newsLinks: readonly PublicContentBlogDetailRelatedLink[];
  repoSourceLinks: readonly PublicContentBlogDetailSourceLink[];
  supportLinks: readonly PublicContentBlogDetailRelatedLink[];
};

const BLOG_AUTHOR = {
  authorDescription: "YEON 제품 운영과 개발 기록",
  authorName: "YEON",
} as const;

const REPO_SOURCE_PREFIXES = [
  {
    localPrefix: "/Users/osuma/coding_stuffs/yeon/",
    repoBaseUrl: "https://github.com/yeon-intergation-platform/yeon",
  },
  {
    localPrefix: "/Users/osuma/coding_stuffs/discord-assitant/",
    repoBaseUrl: "https://github.com/Hyeonjun0527/discord-ai-network-bot",
  },
  {
    localPrefix: "/Users/osuma/coding_stuffs/backend-engineering-evidence/",
    repoBaseUrl: "https://github.com/Hyeonjun0527/backend-engineering-evidence",
  },
] as const;

function compareArticlesByDate(
  left: PublicContentArticle,
  right: PublicContentArticle
) {
  return right.publishedAt.localeCompare(left.publishedAt);
}

function buildArticleLink(article: PublicContentArticle) {
  return {
    href: buildPublicContentCanonicalUrl(article.channel, article.slugSegments),
    title: article.title,
  };
}

function getRelatedSupportLinks(article: PublicContentArticle) {
  return getPublicContentArticles(PUBLIC_CONTENT_CHANNELS.support)
    .filter((supportArticle) => supportArticle.service === article.service)
    .sort(compareArticlesByDate)
    .slice(0, 2)
    .map(buildArticleLink);
}

function getRelatedNewsLinks(article: PublicContentArticle) {
  return getPublicContentArticles(PUBLIC_CONTENT_CHANNELS.news)
    .filter(
      (newsArticle) =>
        newsArticle.service === article.service &&
        (newsArticle.category === "notice" ||
          newsArticle.category === "updates")
    )
    .sort(compareArticlesByDate)
    .slice(0, 2)
    .map(buildArticleLink);
}

function hasFileExtension(relativePath: string) {
  return /\/?[^/]+\.[^/]+$/.test(relativePath);
}

function buildRepoSourceLink(sourcePath: string) {
  const sourcePrefix = REPO_SOURCE_PREFIXES.find((prefix) =>
    sourcePath.startsWith(prefix.localPrefix)
  );

  if (!sourcePrefix) return null;

  const relativePath = sourcePath.slice(sourcePrefix.localPrefix.length);
  const gitPathKind = hasFileExtension(relativePath) ? "blob" : "tree";

  return {
    href: `${sourcePrefix.repoBaseUrl}/${gitPathKind}/main/${relativePath}`,
    label: relativePath,
  };
}

function getRepoSourceLinks(article: PublicContentArticle) {
  if (article.category !== "engineering") return [];

  return article.sourcePaths.flatMap((sourcePath) => {
    const link = buildRepoSourceLink(sourcePath);

    return link ? [link] : [];
  });
}

export function getPublicContentBlogDetailModel(
  article: PublicContentArticle
): PublicContentBlogDetailModel | null {
  if (article.channel !== PUBLIC_CONTENT_CHANNELS.blog) return null;

  return {
    ...BLOG_AUTHOR,
    newsLinks: getRelatedNewsLinks(article),
    repoSourceLinks: getRepoSourceLinks(article),
    supportLinks: getRelatedSupportLinks(article),
  };
}
