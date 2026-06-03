import { createYeonUrl } from "@yeon/ui/runtime/YeonBrowserRuntime";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import type { YeonMetadataRoute } from "@yeon/ui/runtime/YeonMetadataRoute";

export const CANONICAL_SITE_URL = "https://yeon.world";

export const SERVICE_CANONICAL_URLS = {
  typing: "https://typing.yeon.world",
  card: "https://card.yeon.world",
  community: "https://community.yeon.world",
} as const;

const DEFAULT_APP_URL = CANONICAL_SITE_URL;
const WWW_SITE_HOSTNAME = "www.yeon.world";
const DEV_SITE_HOSTNAME = "dev.yeon.world";

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

export const INDEXABLE_SITEMAP_ENTRIES = [
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
    url: `${CANONICAL_SITE_URL}/privacy`,
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    url: `${CANONICAL_SITE_URL}/terms`,
    changeFrequency: "yearly",
    priority: 0.2,
  },
] as const satisfies readonly {
  url: string;
  changeFrequency: NonNullable<
    YeonMetadataRoute["Sitemap"][number]["changeFrequency"]
  >;
  priority: number;
}[];

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

export function getIndexableSitemapEntries(): YeonMetadataRoute["Sitemap"] {
  return INDEXABLE_SITEMAP_ENTRIES.map((entry) => ({
    url: entry.url,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
