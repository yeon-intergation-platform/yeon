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

export type ServiceSubdomainHost = keyof typeof SERVICE_SUBDOMAIN_ROUTES;
export type ServiceRouteSlug =
  (typeof SERVICE_SUBDOMAIN_ROUTES)[ServiceSubdomainHost]["servicePath"];

const ROOT_CANONICAL_HOST = "yeon.world";

const REWRITE_EXCLUDED_PATH_PREFIXES = [
  "/api",
  "/auth",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
] as const;

function normalizeHost(rawHost: string | null | undefined) {
  const firstHost = rawHost?.split(",")[0]?.trim().toLowerCase();
  if (!firstHost) return "";

  if (firstHost.startsWith("[")) {
    return firstHost.slice(0, firstHost.indexOf("]") + 1);
  }

  return firstHost.split(":")[0] ?? "";
}

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
  const url = new URL(suffixPathname, publicUrl);
  url.search = search;
  return url;
}

function findServiceRouteByPathname(pathname: string) {
  return Object.values(SERVICE_SUBDOMAIN_ROUTES).find(({ servicePath }) =>
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
  const normalizedHost = normalizeHost(host);
  const serviceRoute =
    SERVICE_SUBDOMAIN_ROUTES[normalizedHost as ServiceSubdomainHost];

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
  const normalizedHost = normalizeHost(host);
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
    SERVICE_SUBDOMAIN_ROUTES[normalizedHost as ServiceSubdomainHost];

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
