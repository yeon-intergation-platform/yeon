import {
  PUBLIC_CONTENT_CHANNELS,
  buildPublicContentCanonicalUrl,
  getPublicContentArticles,
  getPublicContentCategoryLabel,
  type PublicContentArticle,
} from "./public-content-data";

const BLOG_CATEGORY_ORDER = [
  "engineering",
  "product",
  "devlog",
  "essay",
] as const;

const BLOG_CATEGORY_PURPOSES = {
  engineering: "기술 선택과 구현 근거",
  product: "사용자 문제와 제품 판단",
  devlog: "진행 상황과 배운 점",
  essay: "짧은 개인 관점과 제품 철학",
} as const satisfies Record<(typeof BLOG_CATEGORY_ORDER)[number], string>;

export type PublicContentBlogCategoryEntry = {
  article: PublicContentArticle;
  count: number;
  href: string;
  key: string;
  label: string;
  purpose: string;
};

export type PublicContentBlogHomeModel = {
  categoryEntries: readonly PublicContentBlogCategoryEntry[];
  latestArticles: readonly PublicContentArticle[];
};

function compareArticlesByDate(
  left: PublicContentArticle,
  right: PublicContentArticle
) {
  return right.publishedAt.localeCompare(left.publishedAt);
}

function getBlogArticles() {
  return getPublicContentArticles(PUBLIC_CONTENT_CHANNELS.blog).sort(
    compareArticlesByDate
  );
}

function getCategoryEntries(
  articles: readonly PublicContentArticle[]
): PublicContentBlogCategoryEntry[] {
  return BLOG_CATEGORY_ORDER.flatMap((category) => {
    const categoryArticles = articles.filter(
      (article) => article.category === category
    );
    const article = categoryArticles[0];
    if (!article) return [];

    return [
      {
        article,
        count: categoryArticles.length,
        href: buildPublicContentCanonicalUrl(PUBLIC_CONTENT_CHANNELS.blog, [
          category,
        ]),
        key: category,
        label: getPublicContentCategoryLabel(category),
        purpose: BLOG_CATEGORY_PURPOSES[category],
      },
    ];
  });
}

export function getPublicContentBlogHomeModel(): PublicContentBlogHomeModel {
  const articles = getBlogArticles();

  return {
    categoryEntries: getCategoryEntries(articles),
    latestArticles: articles.slice(0, 4),
  };
}
