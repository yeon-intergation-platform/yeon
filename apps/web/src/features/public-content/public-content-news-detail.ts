import {
  PUBLIC_CONTENT_CHANNELS,
  buildPublicContentCanonicalUrl,
  getPublicContentArticles,
  getPublicContentCategoryLabel,
  getPublicContentServiceLabel,
  type PublicContentArticle,
} from "./public-content-data";

export type PublicContentNewsDetailLink = {
  href: string;
  label: string;
};

export type PublicContentNewsDetailSection = {
  body: string;
  links?: readonly PublicContentNewsDetailLink[];
  title: string;
};

function getSupportLink(article: PublicContentArticle) {
  if (!article.ctaHref?.startsWith("https://support.yeon.world")) return null;

  return {
    href: article.ctaHref,
    label: article.ctaLabel ?? "관련 support 문서 보기",
  };
}

function getRelatedBlogLinks(article: PublicContentArticle) {
  return getPublicContentArticles(PUBLIC_CONTENT_CHANNELS.blog)
    .filter((candidate) => candidate.service === article.service)
    .slice(0, 2)
    .map((candidate) => ({
      href: buildPublicContentCanonicalUrl(
        candidate.channel,
        candidate.slugSegments
      ),
      label: candidate.title,
    }));
}

function buildNoticeSections(
  article: PublicContentArticle
): PublicContentNewsDetailSection[] {
  const serviceLabel = getPublicContentServiceLabel(article.service);
  const nextAction = article.ctaHref
    ? "하단의 관련 링크를 열어 연결된 공개 문서를 확인합니다."
    : "별도 조치 없이 변경된 운영 기준만 확인하면 됩니다.";

  return [
    {
      title: "무엇이 바뀌었나요",
      body: article.summary,
    },
    {
      title: "사용자에게 영향이 있나요",
      body: `${serviceLabel} 관련 공개 콘텐츠 탐색과 운영 기준에 영향을 줍니다.`,
    },
    {
      title: "필요한 조치",
      body: nextAction,
      links: article.ctaHref
        ? [
            {
              href: article.ctaHref,
              label: article.ctaLabel ?? "관련 문서 보기",
            },
          ]
        : undefined,
    },
  ];
}

function buildUpdateSections(
  article: PublicContentArticle
): PublicContentNewsDetailSection[] {
  const supportLink = getSupportLink(article);
  const serviceLabel = getPublicContentServiceLabel(article.service);

  return [
    {
      title: "변경 전",
      body: `${serviceLabel} 사용자는 관련 도움말을 개별 화면이나 기존 안내에서 찾아야 했습니다.`,
    },
    {
      title: "변경 후",
      body: article.summary,
    },
    {
      title: "관련 support 문서",
      body: supportLink
        ? "변경 내용을 바로 따라 할 수 있는 support 문서로 연결합니다."
        : "연결할 support 문서가 정해지면 이 영역에 추가합니다.",
      links: supportLink ? [supportLink] : undefined,
    },
  ];
}

function buildIndustryNewsSections(
  article: PublicContentArticle
): PublicContentNewsDetailSection[] {
  const blogLinks = getRelatedBlogLinks(article);
  const categoryLabel = getPublicContentCategoryLabel(article.category);

  return [
    {
      title: "YEON 서비스와의 관련성",
      body: `${categoryLabel}은 속보보다 YEON 사용자가 확인해야 할 운영 기준과 제품 판단을 중심으로 해석합니다.`,
    },
    {
      title: "관련 blog 글",
      body:
        blogLinks.length > 0
          ? "더 긴 제작 배경과 기술 판단은 관련 blog 글에서 이어서 확인할 수 있습니다."
          : "관련 blog 글이 준비되면 이 영역에 연결합니다.",
      links: blogLinks,
    },
  ];
}

export function getPublicContentNewsDetailSections(
  article: PublicContentArticle
): PublicContentNewsDetailSection[] {
  if (article.channel !== PUBLIC_CONTENT_CHANNELS.news) return [];

  if (article.category === "notice") {
    return buildNoticeSections(article);
  }

  if (article.category === "updates") {
    return buildUpdateSections(article);
  }

  if (article.category === "news") {
    return buildIndustryNewsSections(article);
  }

  return [];
}

export function hasPublicContentNewsDetailSections(
  article: PublicContentArticle,
  requiredTitles: readonly string[]
) {
  const titles = new Set(
    getPublicContentNewsDetailSections(article).map((section) => section.title)
  );

  return requiredTitles.every((title) => titles.has(title));
}
