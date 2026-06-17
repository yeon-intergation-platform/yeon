import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getPlatformServiceByPathname,
  serviceRequiresAuthentication,
} from "@/lib/platform-services";
import {
  CANONICAL_SITE_URL,
  NOINDEX_X_ROBOTS_TAG_VALUE,
  isDevHostname,
  isWwwHostname,
} from "@/lib/seo";
import { normalizeRequestHostname } from "@/lib/request-host";
import {
  resolveLegacyServicePathRedirectUrl,
  resolveServiceSubdomainRewritePath,
} from "@/lib/subdomain-routing";
import { AUTH_SESSION_COOKIE_NAME } from "@/server/auth/constants";

const COUNSELING_SERVICE_BASE_PATH = "/counseling-service";

function withSeoHeaders(response: NextResponse, hostname: string) {
  if (isDevHostname(hostname)) {
    response.headers.set("X-Robots-Tag", NOINDEX_X_ROBOTS_TAG_VALUE);
  }

  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHost =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.hostname;
  const hostname = normalizeRequestHostname(requestHost);

  if (isWwwHostname(hostname)) {
    const redirectUrl = new URL(request.url);
    const canonicalUrl = new URL(CANONICAL_SITE_URL);

    redirectUrl.protocol = canonicalUrl.protocol;
    redirectUrl.hostname = canonicalUrl.hostname;
    redirectUrl.port = canonicalUrl.port;

    return NextResponse.redirect(redirectUrl, 308);
  }

  const legacyServiceRedirectUrl = resolveLegacyServicePathRedirectUrl({
    host: requestHost,
    pathname,
    search: request.nextUrl.search,
  });

  if (legacyServiceRedirectUrl) {
    return withSeoHeaders(
      NextResponse.redirect(legacyServiceRedirectUrl, 308),
      hostname
    );
  }

  const subdomainRewritePath = resolveServiceSubdomainRewritePath({
    host: requestHost,
    pathname,
    search: request.nextUrl.search,
  });

  if (subdomainRewritePath) {
    const rewriteUrl = request.nextUrl.clone();
    const targetUrl = new URL(subdomainRewritePath, request.url);
    rewriteUrl.pathname = targetUrl.pathname;
    rewriteUrl.search = targetUrl.search;
    return withSeoHeaders(NextResponse.rewrite(rewriteUrl), hostname);
  }

  if (pathname.startsWith(`${COUNSELING_SERVICE_BASE_PATH}/api/`)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname.slice(COUNSELING_SERVICE_BASE_PATH.length);
    return withSeoHeaders(NextResponse.rewrite(rewriteUrl), hostname);
  }

  const matchedService = getPlatformServiceByPathname(pathname);
  const isServiceApiRequest =
    matchedService !== null &&
    pathname.startsWith(`${matchedService.href}/api/`);
  const hasSessionCookie = Boolean(
    request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value
  );

  if (
    matchedService &&
    serviceRequiresAuthentication(matchedService) &&
    !isServiceApiRequest &&
    !hasSessionCookie
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.searchParams.set("login", "1");
    redirectUrl.searchParams.set(
      "next",
      `${pathname}${request.nextUrl.search}`
    );
    return withSeoHeaders(NextResponse.redirect(redirectUrl), hostname);
  }

  return withSeoHeaders(NextResponse.next(), hostname);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
