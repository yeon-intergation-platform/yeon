import { createYeonUrl } from "@yeon/ui/runtime/YeonBrowserRuntime";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import type { YeonMetadataRoute } from "@yeon/ui/runtime/YeonMetadataRoute";
import {
  PUBLIC_CONTENT_CHANNEL_CONFIG,
  type PublicContentChannel,
  type PublicContentArticle,
  getPublicContentSitemapEntries,
} from "@/features/public-content/public-content-data";
import { getGameSlugs } from "@/features/game-service/game-catalog";

export const CANONICAL_SITE_URL = "https://yeon.world";

export const SERVICE_CANONICAL_URLS = {
  typing: "https://typing.yeon.world",
  card: "https://card.yeon.world",
  community: "https://community.yeon.world",
  game: "https://game.yeon.world",
  todo: "https://todo.yeon.world",
} as const;

export const PUBLIC_CONTENT_CANONICAL_URLS = {
  support: PUBLIC_CONTENT_CHANNEL_CONFIG.support.host,
  news: PUBLIC_CONTENT_CHANNEL_CONFIG.news.host,
  blog: PUBLIC_CONTENT_CHANNEL_CONFIG.blog.host,
} as const satisfies Record<PublicContentChannel, string>;

const ROOT_CANONICAL_HOSTNAME = "yeon.world";
const DEFAULT_APP_URL = CANONICAL_SITE_URL;
const WWW_SITE_HOSTNAME = "www.yeon.world";
const DEV_SITE_HOSTNAME = "dev.yeon.world";

const PUBLIC_SEO_HOSTNAMES = [
  ROOT_CANONICAL_HOSTNAME,
  ...Object.values(SERVICE_CANONICAL_URLS).map(
    (url) => createYeonUrl(url).hostname
  ),
  ...Object.values(PUBLIC_CONTENT_CANONICAL_URLS).map(
    (url) => createYeonUrl(url).hostname
  ),
] as const;

const COMMON_ROBOTS_DISALLOW = [
  "/admin/",
  "/api/",
  "/auth/",
  "/check/",
  "/landing",
  "/preview/",
  "/contest",
  "/mockdata/",
  "/legacy-counseling-records",
  "/counseling-service",
] as const;

export const NOINDEX_X_ROBOTS_TAG_VALUE = "noindex, nofollow";

export const NON_INDEXABLE_ROBOTS: YeonPageMetadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

type IndexableSitemapEntry = YeonMetadataRoute["Sitemap"][number];

const STATIC_INDEXABLE_SITEMAP_ENTRIES = [
  {
    url: `${CANONICAL_SITE_URL}/`,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: SERVICE_CANONICAL_URLS.typing,
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: SERVICE_CANONICAL_URLS.community,
    changeFrequency: "daily",
    priority: 0.85,
  },
  {
    url: SERVICE_CANONICAL_URLS.todo,
    changeFrequency: "daily",
    priority: 0.85,
  },
  {
    url: `${SERVICE_CANONICAL_URLS.typing}/rooms`,
    changeFrequency: "daily",
    priority: 0.85,
  },
  {
    url: `${SERVICE_CANONICAL_URLS.typing}/decks`,
    changeFrequency: "daily",
    priority: 0.85,
  },
  {
    url: SERVICE_CANONICAL_URLS.card,
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: SERVICE_CANONICAL_URLS.game,
    changeFrequency: "weekly",
    priority: 0.8,
  },
  ...getGameSlugs().map(
    (slug): IndexableSitemapEntry => ({
      url: `${SERVICE_CANONICAL_URLS.game}/${slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  ),
  {
    url: `${CANONICAL_SITE_URL}/privacy`,
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    url: `${CANONICAL_SITE_URL}/terms`,
    changeFrequency: "yearly",
    priority: 0.2,
  },
] satisfies readonly IndexableSitemapEntry[];

export const INDEXABLE_SITEMAP_ENTRIES = [
  ...STATIC_INDEXABLE_SITEMAP_ENTRIES,
  ...getPublicContentSitemapEntries(),
] satisfies readonly IndexableSitemapEntry[];

function parseUrl(rawUrl: string | undefined) {
  try {
    return createYeonUrl(rawUrl ?? DEFAULT_APP_URL);
  } catch {
    return createYeonUrl(DEFAULT_APP_URL);
  }
}

function normalizeHostname(hostname: string | null | undefined) {
  return hostname?.toLowerCase() ?? "";
}

export function getCanonicalSite() {
  return createYeonUrl(CANONICAL_SITE_URL);
}

export function getDeploymentSite() {
  return parseUrl(process.env.NEXT_PUBLIC_APP_URL);
}

export function getSeoMetadataBase() {
  return getCanonicalSite();
}

export function isCanonicalDeployment() {
  return getDeploymentSite().origin === getCanonicalSite().origin;
}

export function isWwwHostname(hostname: string | null | undefined) {
  return normalizeHostname(hostname) === WWW_SITE_HOSTNAME;
}

export function isDevHostname(hostname: string | null | undefined) {
  return normalizeHostname(hostname) === DEV_SITE_HOSTNAME;
}

function resolvePublicSeoHostname(hostname: string | null | undefined) {
  const normalizedHostname = normalizeHostname(hostname);

  if (isWwwHostname(normalizedHostname)) {
    return ROOT_CANONICAL_HOSTNAME;
  }

  if (
    PUBLIC_SEO_HOSTNAMES.includes(
      normalizedHostname as (typeof PUBLIC_SEO_HOSTNAMES)[number]
    )
  ) {
    return normalizedHostname;
  }

  if (!normalizedHostname && isCanonicalDeployment()) {
    return ROOT_CANONICAL_HOSTNAME;
  }

  return null;
}

function getPublicSeoOriginForHostname(hostname: string | null | undefined) {
  const publicSeoHostname = resolvePublicSeoHostname(hostname);
  if (!publicSeoHostname) return null;

  if (publicSeoHostname === ROOT_CANONICAL_HOSTNAME) {
    return CANONICAL_SITE_URL;
  }

  const serviceCanonicalUrl = Object.values(SERVICE_CANONICAL_URLS).find(
    (url) => createYeonUrl(url).hostname === publicSeoHostname
  );

  if (serviceCanonicalUrl) {
    return serviceCanonicalUrl;
  }

  const publicContentCanonicalUrl = Object.values(
    PUBLIC_CONTENT_CANONICAL_URLS
  ).find((url) => createYeonUrl(url).hostname === publicSeoHostname);

  return publicContentCanonicalUrl ?? null;
}

export function buildCanonicalUrl(pathname: string) {
  return createYeonUrl(pathname, getCanonicalSite()).toString();
}

export function buildServiceCanonicalUrl(
  service: keyof typeof SERVICE_CANONICAL_URLS,
  pathname = "/"
) {
  return createYeonUrl(pathname, SERVICE_CANONICAL_URLS[service]).toString();
}

export function getDefaultSiteRobots(): YeonPageMetadata["robots"] {
  return isCanonicalDeployment()
    ? {
        index: true,
        follow: true,
      }
    : NON_INDEXABLE_ROBOTS;
}

export function getIndexableSitemapEntries(
  publicContentArticles?: readonly PublicContentArticle[]
): YeonMetadataRoute["Sitemap"] {
  const entries = publicContentArticles
    ? [
        ...STATIC_INDEXABLE_SITEMAP_ENTRIES,
        ...getPublicContentSitemapEntries(publicContentArticles),
      ]
    : INDEXABLE_SITEMAP_ENTRIES;

  return entries.map((entry) => ({
    url: entry.url,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
    lastModified: entry.lastModified,
  }));
}

export function getIndexableSitemapEntriesForHostname(
  hostname: string | null | undefined,
  publicContentArticles?: readonly PublicContentArticle[]
): YeonMetadataRoute["Sitemap"] {
  const publicSeoOrigin = getPublicSeoOriginForHostname(hostname);
  if (!publicSeoOrigin) return [];

  const publicSeoHostname = createYeonUrl(publicSeoOrigin).hostname;

  return getIndexableSitemapEntries(publicContentArticles).filter((entry) => {
    return createYeonUrl(entry.url).hostname === publicSeoHostname;
  });
}

export function buildSitemapUrlForHostname(
  hostname: string | null | undefined
) {
  const publicSeoOrigin = getPublicSeoOriginForHostname(hostname);
  return publicSeoOrigin
    ? createYeonUrl("/sitemap.xml", publicSeoOrigin).toString()
    : null;
}

export function getRobotsForHostname(
  hostname: string | null | undefined
): YeonMetadataRoute["Robots"] {
  if (isDevHostname(hostname)) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const publicSeoOrigin = getPublicSeoOriginForHostname(hostname);
  if (!publicSeoOrigin) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...COMMON_ROBOTS_DISALLOW],
    },
    sitemap: createYeonUrl("/sitemap.xml", publicSeoOrigin).toString(),
    host: publicSeoOrigin,
  };
}
