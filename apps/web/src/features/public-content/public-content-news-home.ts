import {
  PUBLIC_CONTENT_CHANNELS,
  buildPublicContentCanonicalUrl,
  getPublicContentArticles,
  getPublicContentServiceLabel,
  type PublicContentArticle,
} from "./public-content-data";

export const PUBLIC_CONTENT_NEWS_HOME_CATEGORY_ORDER = [
  "notice",
  "updates",
  "news",
] as const;

type PublicContentNewsHomeCategory =
  (typeof PUBLIC_CONTENT_NEWS_HOME_CATEGORY_ORDER)[number];

type PublicContentNewsContextItem = {
  label: string;
  value: string;
};

export type PublicContentNewsArticleContext = {
  heading: string;
  items: readonly PublicContentNewsContextItem[];
};

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

function getUpdateImpact(article: PublicContentArticle) {
  const serviceLabel = getPublicContentServiceLabel(article.service);

  if (article.ctaHref?.startsWith("https://support.yeon.world")) {
    return `${serviceLabel} 사용자가 바로 확인할 support 문서가 추가되었습니다.`;
  }

  return `${serviceLabel} 사용자에게 영향을 주는 변경사항입니다.`;
}

export function getPublicContentNewsArticleContext(
  article: PublicContentArticle
): PublicContentNewsArticleContext | null {
  if (article.channel !== PUBLIC_CONTENT_CHANNELS.news) return null;

  const serviceLabel = getPublicContentServiceLabel(article.service);

  if (article.category === "notice") {
    return {
      heading: "공지 정보",
      items: [
        { label: "적용 서비스", value: serviceLabel },
        { label: "적용일", value: article.publishedAt },
      ],
    };
  }

  if (article.category === "updates") {
    return {
      heading: "업데이트 정보",
      items: [
        { label: "변경 요약", value: article.summary },
        { label: "사용자 영향도", value: getUpdateImpact(article) },
      ],
    };
  }

  if (article.category === "news") {
    return {
      heading: "해설 정보",
      items: [
        { label: "관련 서비스", value: serviceLabel },
        {
          label: "YEON 관련성",
          value: `${serviceLabel} 운영 기준과 연결해 해석하는 글입니다.`,
        },
      ],
    };
  }

  return null;
}

export function getPublicContentNewsHomeModel(): PublicContentNewsHomeModel {
  const articles = getPublicContentArticles(PUBLIC_CONTENT_CHANNELS.news);
  const featuredArticle =
    [...articles]
      .filter((article) => article.category === "notice")
      .sort(compareArticlesByDate)[0] ??
    [...articles].sort(compareNewsHomePriority)[0] ??
    null;
  const filters: PublicContentNewsHomeFilter[] = [
    {
      count: articles.length,
      href: buildPublicContentCanonicalUrl(PUBLIC_CONTENT_CHANNELS.news),
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
          href: buildPublicContentCanonicalUrl(PUBLIC_CONTENT_CHANNELS.news, [
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
