import {
  buildPublicContentCanonicalUrl,
  getPublicContentCategoryLabel,
  getPublicContentChannelConfig,
  getPublicContentServiceLabel,
  PUBLIC_CONTENT_SERVICES,
  type PublicContentArticle,
  type PublicContentBlock,
  type PublicContentService,
} from "./public-content-data";

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
  return block.items.join(" ");
}

function getArticleBodyText(article: PublicContentArticle) {
  return article.body.map(getBlockText).join(" ").trim();
}

function isPublicContentService(value: string): value is PublicContentService {
  return Object.values(PUBLIC_CONTENT_SERVICES).some(
    (service) => service === value
  );
}

function getBreadcrumbName(segment: string) {
  if (isPublicContentService(segment)) {
    return getPublicContentServiceLabel(segment);
  }
  return getPublicContentCategoryLabel(segment);
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
  const config = getPublicContentChannelConfig(article.channel);
  const prefixSegments = article.slugSegments.slice(0, -1);
  const collectionItems = prefixSegments.map((_, index) => {
    const slugSegments = prefixSegments.slice(0, index + 1);
    const segment = slugSegments[slugSegments.length - 1] ?? "";

    return {
      "@type": "ListItem",
      item: buildPublicContentCanonicalUrl(article.channel, slugSegments),
      name: getBreadcrumbName(segment),
      position: index + 2,
    };
  });

  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        item: config.host,
        name: config.label,
        position: 1,
      },
      ...collectionItems,
      {
        "@type": "ListItem",
        item: getArticleUrl(article),
        name: article.title,
        position: collectionItems.length + 2,
      },
    ],
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
