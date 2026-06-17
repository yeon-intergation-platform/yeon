import {
  PUBLIC_CONTENT_CHANNELS,
  type PublicContentArticle,
  type PublicContentBlock,
} from "./public-content-data";

const NEWS_INDUSTRY_SUMMARY_MAX_LENGTH = 180;
const NEWS_LONG_PARAGRAPH_MAX_LENGTH = 520;
const NEWS_MARKETING_PHRASES = [
  "세계 최고",
  "업계 최고",
  "압도적",
  "혁신적인",
  "완벽한",
  "놀라운",
] as const;
const NEWS_PRESS_RELEASE_PHRASES = [
  "공식 론칭",
  "대대적으로",
  "전격 공개",
  "세계 최초",
  "업계 최초",
] as const;

function isExternalWebUrl(href: string) {
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function getPlainTextsFromBlock(block: PublicContentBlock): string[] {
  if (block.type === "paragraph") return [block.text];
  if (block.type === "heading") return [block.title];
  if (block.type === "callout") return [block.title, block.text];
  if (block.type === "steps" || block.type === "checklist") {
    return [...block.items];
  }
  if (block.type === "links") {
    return [block.title, ...block.links.map((link) => link.label)];
  }
  if (block.type === "image") return [block.alt, block.caption ?? ""];
  if (block.type === "code") return [block.filename ?? "", block.language];

  return [];
}

function getArticlePlainText(article: PublicContentArticle) {
  return [
    article.title,
    article.description,
    article.summary,
    ...article.body.flatMap(getPlainTextsFromBlock),
  ].join(" ");
}

export function hasPublicContentExternalReferenceLink(
  article: PublicContentArticle
) {
  return article.body.some(
    (block) =>
      block.type === "links" &&
      block.links.some((link) => isExternalWebUrl(link.href))
  );
}

export function getPublicContentNewsEditorialWarnings(
  article: PublicContentArticle
) {
  if (article.channel !== PUBLIC_CONTENT_CHANNELS.news) return [];

  const warnings: string[] = [];
  const articleText = getArticlePlainText(article);
  const marketingPhrase = NEWS_MARKETING_PHRASES.find((phrase) =>
    articleText.includes(phrase)
  );
  if (marketingPhrase) {
    warnings.push(
      `news 글은 과장된 마케팅 표현을 피해야 합니다: ${marketingPhrase}`
    );
  }

  if (article.category !== "news") return warnings;

  if (article.summary.length > NEWS_INDUSTRY_SUMMARY_MAX_LENGTH) {
    warnings.push("업계 뉴스 해설 summary는 외부 소식을 짧게 요약해야 합니다.");
  }

  if (!hasPublicContentExternalReferenceLink(article)) {
    warnings.push("업계 뉴스 해설은 공개 본문에 외부 출처 링크가 필요합니다.");
  }

  const copiedParagraph = article.body.find(
    (block) =>
      block.type === "paragraph" &&
      block.text.length > NEWS_LONG_PARAGRAPH_MAX_LENGTH
  );
  if (copiedParagraph) {
    warnings.push(
      "업계 뉴스 해설은 원문 복사로 보일 수 있는 긴 paragraph를 피해야 합니다."
    );
  }

  const pressReleasePhrase = NEWS_PRESS_RELEASE_PHRASES.find((phrase) =>
    articleText.includes(phrase)
  );
  if (pressReleasePhrase) {
    warnings.push(
      `업계 뉴스 해설은 보도자료처럼 보이는 표현을 피해야 합니다: ${pressReleasePhrase}`
    );
  }

  return warnings;
}
