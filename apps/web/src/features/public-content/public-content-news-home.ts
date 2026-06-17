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

export type PublicContentNewsHomeSection = {
  articles: readonly PublicContentArticle[];
  category: PublicContentNewsHomeCategory;
  description: string;
  href: string;
  title: string;
};

export type PublicContentNewsHomeModel = {
  featuredArticle: PublicContentArticle | null;
  sections: readonly PublicContentNewsHomeSection[];
};

const NEWS_HOME_SECTION_COPY = {
  notice: {
    title: "공식 공지",
    description: "운영 기준, 공개 채널, 중요한 정책 변화를 먼저 확인합니다.",
  },
  updates: {
    title: "제품 업데이트",
    description: "서비스 변경 요약과 사용자가 바로 확인할 영향을 정리합니다.",
  },
  news: {
    title: "업계 뉴스 해설",
    description:
      "AI, Discord, 개발자 생태계 변화가 YEON 사용자에게 주는 의미만 다룹니다.",
  },
} as const satisfies Record<
  PublicContentNewsHomeCategory,
  {
    description: string;
    title: string;
  }
>;

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
    [...articles].sort(compareNewsHomePriority)[0] ?? null;
  const sections = PUBLIC_CONTENT_NEWS_HOME_CATEGORY_ORDER.map((category) => {
    const sectionArticles = articles
      .filter((article) => article.category === category)
      .sort(compareArticlesByDate);
    const copy = NEWS_HOME_SECTION_COPY[category];

    return {
      articles: sectionArticles,
      category,
      description: copy.description,
      href: buildPublicContentCanonicalUrl(PUBLIC_CONTENT_CHANNELS.news, [
        category,
      ]),
      title: copy.title,
    };
  }).filter((section) => section.articles.length > 0);

  return {
    featuredArticle,
    sections,
  };
}
