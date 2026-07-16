import {
  getPublicContentArticles,
  getPublicContentCategoryLabel,
  getPublicContentServiceLabel,
  PUBLIC_CONTENT_CHANNELS,
  type PublicContentArticle,
  type PublicContentBlock,
} from "./public-content-data";

const SUPPORT_SEARCH_RESULT_LIMIT = 12;

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function getBlockSearchText(block: PublicContentBlock) {
  switch (block.type) {
    case "paragraph":
      return block.text;
    case "heading":
      return block.title;
    case "steps":
    case "checklist":
      return block.items.join(" ");
    case "image":
      return [block.alt, block.caption].filter(Boolean).join(" ");
    case "code":
      return [block.filename, block.code].filter(Boolean).join(" ");
    case "links":
      return [block.title, ...block.links.map((link) => link.label)].join(" ");
    case "callout":
      return `${block.title} ${block.text}`;
  }
}

function getArticleSearchText(article: PublicContentArticle) {
  return normalizeSearchText(
    [
      article.title,
      article.description,
      article.summary,
      getPublicContentServiceLabel(article.service),
      getPublicContentCategoryLabel(article.category),
      ...article.body.map(getBlockSearchText),
    ].join(" ")
  );
}

function getArticleSearchScore(article: PublicContentArticle, terms: string[]) {
  const title = normalizeSearchText(article.title);
  const summary = normalizeSearchText(
    `${article.summary} ${article.description}`
  );
  const searchableText = getArticleSearchText(article);

  return terms.reduce((score, term) => {
    if (title.includes(term)) return score + 6;
    if (summary.includes(term)) return score + 3;
    return searchableText.includes(term) ? score + 1 : score;
  }, 0);
}

export function normalizePublicContentSearchQuery(value: string | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

export function searchPublicContentSupportArticles(
  query: string,
  sourceArticles?: readonly PublicContentArticle[]
) {
  const normalizedQuery = normalizePublicContentSearchQuery(query);
  if (!normalizedQuery) return [];

  const terms = normalizeSearchText(normalizedQuery).split(" ").filter(Boolean);

  return getPublicContentArticles(
    PUBLIC_CONTENT_CHANNELS.support,
    sourceArticles
  )
    .filter((article) => {
      const searchableText = getArticleSearchText(article);
      return terms.every((term) => searchableText.includes(term));
    })
    .sort(
      (left, right) =>
        getArticleSearchScore(right, terms) -
          getArticleSearchScore(left, terms) ||
        right.updatedAt.localeCompare(left.updatedAt) ||
        left.title.localeCompare(right.title, "ko-KR")
    )
    .slice(0, SUPPORT_SEARCH_RESULT_LIMIT);
}
