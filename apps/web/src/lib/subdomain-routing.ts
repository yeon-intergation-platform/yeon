import { createYeonUrl } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { normalizeRequestHostname } from "./request-host";

export const SERVICE_SUBDOMAIN_ROUTES = {
  "typing.yeon.world": {
    servicePath: "/typing-service",
    publicUrl: "https://typing.yeon.world",
  },
  "card.yeon.world": {
    servicePath: "/card-service",
    publicUrl: "https://card.yeon.world",
  },
  "community.yeon.world": {
    servicePath: "/community",
    publicUrl: "https://community.yeon.world",
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

  if (!serviceRoute) return null;
  if (isExcludedRewritePath(pathname)) return null;
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
    return null;
  }

  return buildServicePublicUrl({
    publicUrl: subdomainRoute.publicUrl,
    serviceBasePath: serviceRoute.servicePath,
    pathname,
    search,
  });
}
