import {
  buildPublicContentCanonicalUrl,
  buildPublicContentInternalHref,
  getPublicContentChannelConfig,
  getPublicContentSitemapEntries,
  type PublicContentArticle,
} from "./public-content-data";
import { getPublicContentTitleQualityWarnings } from "./public-content-title-quality";

export type PublicContentOpsToolbarAction = {
  href: string;
  kind: "preview" | "seo" | "sitemap";
  label: string;
};

export type PublicContentOpsToolbarModel = {
  actions: readonly PublicContentOpsToolbarAction[];
  canonicalUrl: string;
  robotsIndexable: false;
  sitemapIncluded: boolean;
  validationMessages: readonly string[];
};

type PublicContentOpsSearchParams = Record<
  string,
  string | string[] | undefined
>;

const SEARCH_CONSOLE_URL = "https://search.google.com/search-console";

function normalizeUrl(url: string) {
  return url.replace(/\/$/, "");
}

function buildSearchConsoleUrl(resourceId: string) {
  return `${SEARCH_CONSOLE_URL}?${new URLSearchParams({
    resource_id: resourceId,
  }).toString()}`;
}

function getFirstSearchParamValue(
  searchParams: PublicContentOpsSearchParams,
  key: string
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

export function isPublicContentOpsModeSearchParams(
  searchParams: PublicContentOpsSearchParams
) {
  const opsValue = getFirstSearchParamValue(searchParams, "ops");

  return opsValue === "1" || opsValue === "true";
}

function getSitemapIncluded(canonicalUrl: string) {
  const sitemapUrls = new Set(
    getPublicContentSitemapEntries().map((entry) => normalizeUrl(entry.url))
  );

  return sitemapUrls.has(normalizeUrl(canonicalUrl));
}

function getValidationMessages(
  article: PublicContentArticle,
  sitemapIncluded: boolean
) {
  const messages = [
    ...getPublicContentTitleQualityWarnings({
      channel: article.channel,
      serviceKey: article.service,
      title: article.title,
    }).map((warning) => `제목 확인 필요: ${warning}`),
  ];

  if (!article.description.trim()) {
    messages.push("설명 문구가 비어 있습니다.");
  }
  if (article.body.length === 0) {
    messages.push("본문 블록이 비어 있습니다.");
  }
  if (article.sourcePaths.length === 0) {
    messages.push("근거 source path가 비어 있습니다.");
  }
  if (!sitemapIncluded) {
    messages.push("sitemap에 포함되지 않았습니다.");
  }

  return messages;
}

export function buildPublicContentOpsToolbarModel(
  article: PublicContentArticle,
  params: { enabled: boolean }
): PublicContentOpsToolbarModel | null {
  if (!params.enabled) return null;

  const config = getPublicContentChannelConfig(article.channel);
  const canonicalUrl = buildPublicContentCanonicalUrl(
    article.channel,
    article.slugSegments
  );
  const internalHref = buildPublicContentInternalHref(
    article.channel,
    article.slugSegments
  );
  const sitemapIncluded = getSitemapIncluded(canonicalUrl);

  return {
    actions: [
      {
        href: `${internalHref}?ops=1&preview=draft`,
        kind: "preview",
        label: "draft 보기",
      },
      {
        href: buildSearchConsoleUrl(`${config.host}/`),
        kind: "seo",
        label: "SEO 검사",
      },
      {
        href: `${config.host}/sitemap.xml`,
        kind: "sitemap",
        label: "sitemap",
      },
    ],
    canonicalUrl,
    robotsIndexable: false,
    sitemapIncluded,
    validationMessages: getValidationMessages(article, sitemapIncluded),
  };
}
