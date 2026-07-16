import {
  PUBLIC_CONTENT_CHANNELS,
  getPublicContentArticles,
  getPublicContentCategoryLabel,
  type PublicContentArticle,
} from "./public-content-data";

export const PUBLIC_CONTENT_BLOG_CATEGORIES = [
  "engineering",
  "product",
  "devlog",
  "essay",
] as const;

export const PUBLIC_CONTENT_BLOG_CATEGORY_QUERY_KEY = "category";

export type PublicContentBlogCategory =
  (typeof PUBLIC_CONTENT_BLOG_CATEGORIES)[number];

const BLOG_CATEGORY_PURPOSES = {
  engineering: "기술 선택과 구현 근거",
  product: "사용자 문제와 제품 판단",
  devlog: "진행 상황과 배운 점",
  essay: "짧은 개인 관점과 제품 철학",
} as const satisfies Record<PublicContentBlogCategory, string>;

export type PublicContentBlogCategoryEntry = {
  count: number;
  key: PublicContentBlogCategory;
  label: string;
  purpose: string;
};

export type PublicContentBlogHomeModel = {
  activeCategory?: PublicContentBlogCategory;
  articleCount: number;
  categoryEntries: readonly PublicContentBlogCategoryEntry[];
  totalArticleCount: number;
  visibleArticles: readonly PublicContentArticle[];
};

export function getPublicContentBlogCategory(value?: string) {
  if (!value) return undefined;

  return PUBLIC_CONTENT_BLOG_CATEGORIES.includes(
    value as PublicContentBlogCategory
  )
    ? (value as PublicContentBlogCategory)
    : undefined;
}

export function buildPublicContentBlogCategoryFilterHref({
  category,
  pathname = "/blog",
  searchParams,
}: {
  category?: PublicContentBlogCategory;
  pathname?: string;
  searchParams?: string;
}) {
  const params = new URLSearchParams(searchParams);

  if (category) {
    params.set(PUBLIC_CONTENT_BLOG_CATEGORY_QUERY_KEY, category);
  } else {
    params.delete(PUBLIC_CONTENT_BLOG_CATEGORY_QUERY_KEY);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

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
  return PUBLIC_CONTENT_BLOG_CATEGORIES.flatMap((category) => {
    const categoryArticles = articles.filter(
      (article) => article.category === category
    );
    if (categoryArticles.length === 0) return [];

    return [
      {
        count: categoryArticles.length,
        key: category,
        label: getPublicContentCategoryLabel(category),
        purpose: BLOG_CATEGORY_PURPOSES[category],
      },
    ];
  });
}

export function getPublicContentBlogHomeModel(
  activeCategory?: PublicContentBlogCategory
): PublicContentBlogHomeModel {
  const articles = getBlogArticles();
  const filteredArticles = activeCategory
    ? articles.filter((article) => article.category === activeCategory)
    : articles;

  return {
    activeCategory,
    articleCount: filteredArticles.length,
    categoryEntries: getCategoryEntries(articles),
    totalArticleCount: articles.length,
    visibleArticles: activeCategory ? filteredArticles : articles.slice(0, 4),
  };
}
