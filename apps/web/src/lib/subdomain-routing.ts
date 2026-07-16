import { createYeonUrl } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { normalizeRequestHostname } from "./request-host";

export const SERVICE_SUBDOMAIN_ROUTES = {
  "typing.yeon.world": {
    servicePath: "/typing-service",
    publicUrl: "https://typing.yeon.world",
  },
  // 백지 학습(blurt) — 공개 서비스. 타자와 분리된 독립 서비스 경로.
  "blurt.yeon.world": {
    servicePath: "/recall-service",
    publicUrl: "https://blurt.yeon.world",
  },
  "card.yeon.world": {
    servicePath: "/card-service",
    publicUrl: "https://card.yeon.world",
  },
  "community.yeon.world": {
    servicePath: "/community",
    publicUrl: "https://community.yeon.world",
  },
  "game.yeon.world": {
    servicePath: "/game-service",
    publicUrl: "https://game.yeon.world",
  },
  "todo.yeon.world": {
    servicePath: "/todo-service",
    publicUrl: "https://todo.yeon.world",
  },
} as const;

export const CONTENT_SUBDOMAIN_ROUTES = {
  "support.yeon.world": {
    servicePath: "/support",
    publicUrl: "https://support.yeon.world",
  },
  "news.yeon.world": {
    servicePath: "/news",
    publicUrl: "https://news.yeon.world",
  },
  "blog.yeon.world": {
    servicePath: "/blog",
    publicUrl: "https://blog.yeon.world",
  },
} as const;

const SUBDOMAIN_ROUTES = {
  ...SERVICE_SUBDOMAIN_ROUTES,
  ...CONTENT_SUBDOMAIN_ROUTES,
} as const;

export type ServiceSubdomainHost = keyof typeof SUBDOMAIN_ROUTES;
export type ContentSubdomainHost = keyof typeof CONTENT_SUBDOMAIN_ROUTES;
export type ServiceRouteSlug =
  (typeof SUBDOMAIN_ROUTES)[ServiceSubdomainHost]["servicePath"];

const ROOT_CANONICAL_HOST = "yeon.world";

const REWRITE_EXCLUDED_PATH_PREFIXES = [
  "/api",
  "/auth",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  // 루트 도메인 전용 플랫폼 페이지. 서비스 subdomain에서 접근해도
  // /{service}/profile로 rewrite되어 404 나지 않도록 rewrite 대상에서 제외한다.
  "/profile",
] as const;
const CONTENT_FEED_PATHNAME = "/feed.xml";
const NEWS_CONTENT_CATEGORY_PATH_PREFIXES = [
  "/news/ai",
  "/news/developer",
  "/news/discord",
  "/news/product",
] as const;

function isExcludedRewritePath(pathname: string) {
  if (pathname.includes(".")) return true;

  return REWRITE_EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isAlreadyServicePath(pathname: string, serviceBasePath: string) {
  return (
    pathname === serviceBasePath || pathname.startsWith(`${serviceBasePath}/`)
  );
}

function isNewsContentCategoryPath(hostname: string, pathname: string) {
  if (hostname !== "news.yeon.world") return false;
  if (pathname === "/news") return true;

  return NEWS_CONTENT_CATEGORY_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function buildServicePublicUrl({
  publicUrl,
  serviceBasePath,
  pathname,
  search = "",
}: {
  publicUrl: string;
  serviceBasePath: string;
  pathname: string;
  search?: string;
}) {
  const suffixPathname =
    pathname === serviceBasePath
      ? "/"
      : pathname.slice(serviceBasePath.length) || "/";
  const url = createYeonUrl(suffixPathname, publicUrl);
  url.search = search;
  return url;
}

function findServiceRouteByPathname(pathname: string) {
  return Object.values(SUBDOMAIN_ROUTES).find(({ servicePath }) =>
    isAlreadyServicePath(pathname, servicePath)
  );
}

export function resolveServiceSubdomainRewritePath({
  host,
  pathname,
  search = "",
}: {
  host: string | null | undefined;
  pathname: string;
  search?: string;
}) {
  const normalizedHost = normalizeRequestHostname(host);
  const serviceRoute = SUBDOMAIN_ROUTES[normalizedHost as ServiceSubdomainHost];
  const contentRoute =
    CONTENT_SUBDOMAIN_ROUTES[normalizedHost as ContentSubdomainHost];

  if (!serviceRoute) return null;
  if (contentRoute && pathname === CONTENT_FEED_PATHNAME) {
    return `${contentRoute.servicePath}${CONTENT_FEED_PATHNAME}${search}`;
  }
  if (isExcludedRewritePath(pathname)) return null;
  if (isNewsContentCategoryPath(normalizedHost, pathname)) {
    return `${serviceRoute.servicePath}${pathname}${search}`;
  }
  if (isAlreadyServicePath(pathname, serviceRoute.servicePath)) return null;

  const suffixPathname = pathname === "/" ? "" : pathname;

  return `${serviceRoute.servicePath}${suffixPathname}${search}`;
}

export function resolveLegacyServicePathRedirectUrl({
  host,
  pathname,
  search = "",
}: {
  host: string | null | undefined;
  pathname: string;
  search?: string;
}) {
  const normalizedHost = normalizeRequestHostname(host);
  const serviceRoute = findServiceRouteByPathname(pathname);

  if (!serviceRoute) return null;

  if (normalizedHost === ROOT_CANONICAL_HOST) {
    return buildServicePublicUrl({
      publicUrl: serviceRoute.publicUrl,
      serviceBasePath: serviceRoute.servicePath,
      pathname,
      search,
    });
  }

  const subdomainRoute =
    SUBDOMAIN_ROUTES[normalizedHost as ServiceSubdomainHost];

  if (subdomainRoute?.servicePath !== serviceRoute.servicePath) {
    const currentContentRoute =
      CONTENT_SUBDOMAIN_ROUTES[normalizedHost as ContentSubdomainHost];
    const targetContentRoute = Object.values(CONTENT_SUBDOMAIN_ROUTES).find(
      (route) => route.servicePath === serviceRoute.servicePath
    );

    // 공개 콘텐츠끼리는 내부 base path로 링크해도 대상 채널의 canonical
    // subdomain으로 전환한다. 로컬·dev에서는 이 분기가 실행되지 않아
    // /support, /news, /blog 내부 경로를 그대로 검증할 수 있다.
    if (currentContentRoute && targetContentRoute) {
      return buildServicePublicUrl({
        publicUrl: serviceRoute.publicUrl,
        serviceBasePath: serviceRoute.servicePath,
        pathname,
        search,
      });
    }

    return null;
  }

  if (isNewsContentCategoryPath(normalizedHost, pathname)) {
    return null;
  }

  return buildServicePublicUrl({
    publicUrl: subdomainRoute.publicUrl,
    serviceBasePath: serviceRoute.servicePath,
    pathname,
    search,
  });
}
