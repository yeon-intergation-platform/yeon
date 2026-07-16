import {
  PUBLIC_CONTENT_CHANNELS,
  buildPublicContentInternalHref,
  getPublicContentArticles,
  type PublicContentArticle,
} from "./public-content-data";

export const PUBLIC_CONTENT_NEWS_HOME_CATEGORY_ORDER = [
  "notice",
  "updates",
  "news",
] as const;

type PublicContentNewsHomeCategory =
  (typeof PUBLIC_CONTENT_NEWS_HOME_CATEGORY_ORDER)[number];

export type PublicContentNewsHomeFilter = {
  count: number;
  href: string;
  key: "all" | PublicContentNewsHomeCategory;
  label: string;
};

export type PublicContentNewsHomeModel = {
  featuredArticle: PublicContentArticle | null;
  filters: readonly PublicContentNewsHomeFilter[];
  latestArticles: readonly PublicContentArticle[];
  totalCount: number;
};

const NEWS_HOME_SECTION_COPY = {
  notice: {
    title: "공식 공지",
  },
  updates: {
    title: "제품 업데이트",
  },
  news: {
    title: "업계 뉴스 해설",
  },
} as const satisfies Record<PublicContentNewsHomeCategory, { title: string }>;

const NEWS_HOME_CATEGORY_RANK = new Map<string, number>(
  PUBLIC_CONTENT_NEWS_HOME_CATEGORY_ORDER.map((category, index) => [
    category,
    index,
  ])
);

function compareArticlesByDate(
  left: PublicContentArticle,
  right: PublicContentArticle
) {
  return right.publishedAt.localeCompare(left.publishedAt);
}

function getNewsCategoryRank(article: PublicContentArticle) {
  return (
    NEWS_HOME_CATEGORY_RANK.get(article.category) ?? Number.MAX_SAFE_INTEGER
  );
}

function compareNewsHomePriority(
  left: PublicContentArticle,
  right: PublicContentArticle
) {
  return (
    getNewsCategoryRank(left) - getNewsCategoryRank(right) ||
    compareArticlesByDate(left, right)
  );
}

export function getPublicContentNewsHomeModel(
  sourceArticles?: readonly PublicContentArticle[]
): PublicContentNewsHomeModel {
  const articles = getPublicContentArticles(
    PUBLIC_CONTENT_CHANNELS.news,
    sourceArticles
  );
  const featuredArticle =
    [...articles]
      .filter((article) => article.category === "notice")
      .sort(compareArticlesByDate)[0] ??
    [...articles].sort(compareNewsHomePriority)[0] ??
    null;
  const filters: PublicContentNewsHomeFilter[] = [
    {
      count: articles.length,
      href: buildPublicContentInternalHref(PUBLIC_CONTENT_CHANNELS.news),
      key: "all",
      label: "전체",
    },
    ...PUBLIC_CONTENT_NEWS_HOME_CATEGORY_ORDER.flatMap((category) => {
      const count = articles.filter(
        (article) => article.category === category
      ).length;
      if (count === 0) return [];

      return [
        {
          count,
          href: buildPublicContentInternalHref(PUBLIC_CONTENT_CHANNELS.news, [
            category,
          ]),
          key: category,
          label: NEWS_HOME_SECTION_COPY[category].title,
        },
      ];
    }),
  ];

  return {
    featuredArticle,
    filters,
    latestArticles: [...articles]
      .filter((article) => article !== featuredArticle)
      .sort(compareNewsHomePriority),
    totalCount: articles.length,
  };
}
