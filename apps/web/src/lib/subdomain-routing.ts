export const SERVICE_SUBDOMAIN_ROUTES = {
  "typing.yeon.world": "/typing-service",
  "card.yeon.world": "/card-service",
  "community.yeon.world": "/community",
} as const;

export type ServiceSubdomainHost = keyof typeof SERVICE_SUBDOMAIN_ROUTES;

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
  const serviceBasePath =
    SERVICE_SUBDOMAIN_ROUTES[normalizedHost as ServiceSubdomainHost];

  if (!serviceBasePath) return null;
  if (isExcludedRewritePath(pathname)) return null;
  if (isAlreadyServicePath(pathname, serviceBasePath)) return null;

  const suffixPathname = pathname === "/" ? "" : pathname;

  return `${serviceBasePath}${suffixPathname}${search}`;
}
