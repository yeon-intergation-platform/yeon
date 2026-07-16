import {
  buildPublicContentCanonicalUrl,
  buildPublicContentOpenGraphImageUrl,
  getPublicContentChannelConfig,
  type PublicContentArticle,
  type PublicContentBlock,
} from "./public-content-data";
import { buildPublicContentArticleBreadcrumb } from "./public-content-breadcrumb";

type JsonLdObject = Record<string, unknown>;

function getArticleUrl(article: PublicContentArticle) {
  return buildPublicContentCanonicalUrl(article.channel, article.slugSegments);
}

function getArticleSchemaType(article: PublicContentArticle) {
  if (article.channel === "news") {
    return "NewsArticle";
  }
  if (article.channel === "blog") {
    return "BlogPosting";
  }
  return "Article";
}

function getBlockText(block: PublicContentBlock) {
  if (block.type === "paragraph") {
    return block.text;
  }
  if (block.type === "heading") {
    return block.title;
  }
  if (block.type === "callout") {
    return `${block.title}: ${block.text}`;
  }
  if (block.type === "image") {
    return [block.alt, block.caption].filter(Boolean).join(" ");
  }
  if (block.type === "code") {
    return block.code;
  }
  if (block.type === "links") {
    return [block.title, ...block.links.map((link) => link.label)].join(" ");
  }
  return block.items.join(" ");
}

function getArticleBodyText(article: PublicContentArticle) {
  return article.body.map(getBlockText).join(" ").trim();
}

export function buildPublicContentArticleJsonLd(
  article: PublicContentArticle
): JsonLdObject {
  return {
    "@type": getArticleSchemaType(article),
    author: {
      "@type": "Organization",
      name: "YEON",
    },
    dateModified: article.updatedAt,
    datePublished: article.publishedAt,
    description: article.description,
    headline: article.title,
    image: [buildPublicContentOpenGraphImageUrl(article.channel)],
    inLanguage: "ko-KR",
    mainEntityOfPage: getArticleUrl(article),
    publisher: {
      "@type": "Organization",
      name: "YEON",
      url: "https://yeon.world",
    },
  };
}

export function buildPublicContentBreadcrumbJsonLd(
  article: PublicContentArticle
): JsonLdObject {
  const breadcrumbItems = buildPublicContentArticleBreadcrumb(article);

  return {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      item:
        item.slugSegments.length === 0
          ? getPublicContentChannelConfig(article.channel).host
          : buildPublicContentCanonicalUrl(article.channel, item.slugSegments),
      name: item.label,
      position: index + 1,
    })),
  };
}

export function buildPublicContentFaqPageJsonLd(
  article: PublicContentArticle
): JsonLdObject | null {
  if (article.channel !== "support" || article.category !== "faq") {
    return null;
  }

  const answerText = getArticleBodyText(article);
  if (!answerText) {
    return null;
  }

  return {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        acceptedAnswer: {
          "@type": "Answer",
          text: answerText,
        },
        name: article.title,
      },
    ],
  };
}

export function buildPublicContentHowToJsonLd(
  article: PublicContentArticle
): JsonLdObject | null {
  if (article.channel !== "support") {
    return null;
  }

  const steps = article.body
    .filter((block) => block.type === "steps")
    .flatMap((block) => block.items)
    .filter((item) => item.trim().length > 0);

  if (steps.length === 0) {
    return null;
  }

  return {
    "@type": "HowTo",
    description: article.description,
    inLanguage: "ko-KR",
    name: article.title,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      name: step,
      position: index + 1,
      text: step,
    })),
  };
}

export function buildPublicContentArticleStructuredData(
  article: PublicContentArticle
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildPublicContentArticleJsonLd(article),
      buildPublicContentBreadcrumbJsonLd(article),
      buildPublicContentFaqPageJsonLd(article),
      buildPublicContentHowToJsonLd(article),
    ].filter((node): node is JsonLdObject => node !== null),
  };
}
