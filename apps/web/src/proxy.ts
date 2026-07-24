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
  resolveLegacyHostnameRedirectUrl,
  resolveLegacyServicePathRedirectUrl,
  resolveServiceSubdomainRewritePath,
} from "@/lib/subdomain-routing";
import { resolvePullitProxyTarget } from "@/lib/pullit-proxy";
import { AUTH_SESSION_COOKIE_NAME } from "@/server/auth/constants";

const COUNSELING_SERVICE_BASE_PATH = "/counseling-service";
const SUBDOMAIN_REWRITE_HEADER = "x-yeon-subdomain-rewrite";

function isPublicContentOpsRequest(request: NextRequest) {
  const opsValue = request.nextUrl.searchParams.get("ops");

  return opsValue === "1" || opsValue === "true";
}

function withSeoHeaders(
  response: NextResponse,
  hostname: string,
  request: NextRequest
) {
  if (isDevHostname(hostname) || isPublicContentOpsRequest(request)) {
    response.headers.set("X-Robots-Tag", NOINDEX_X_ROBOTS_TAG_VALUE);
  }

  return response;
}

// 호스팅 SWF(추억의 플래시 게임 원본)는 Ruffle이 fetch로만 불러온다. 주소창 직접 접근/
// 새 탭(sec-fetch-dest: document)으로 받으려는 시도는 404로 막아 원본 파일이 그대로
// 다운로드되는 것을 차단한다. Ruffle의 fetch는 dest가 empty/cors라 정상 재생된다.
// CDN(공유 캐시)이 이 응답을 캐싱해 가드를 우회하지 못하도록 private 캐시로 응답한다.
function guardHostedSwf(request: NextRequest): NextResponse | null {
  if (!request.nextUrl.pathname.endsWith(".swf")) return null;

  const fetchDest = request.headers.get("sec-fetch-dest");
  if (fetchDest === "document") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, max-age=86400");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

export function proxy(request: NextRequest) {
  const swfGuardResponse = guardHostedSwf(request);
  if (swfGuardResponse) return swfGuardResponse;

  const { pathname } = request.nextUrl;
  const requestHost =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.hostname;
  const hostname = normalizeRequestHostname(requestHost);
  const isSubdomainRewritePass =
    request.headers.get(SUBDOMAIN_REWRITE_HEADER) === "1";

  if (isWwwHostname(hostname)) {
    const redirectUrl = new URL(request.url);
    const canonicalUrl = new URL(CANONICAL_SITE_URL);

    redirectUrl.protocol = canonicalUrl.protocol;
    redirectUrl.hostname = canonicalUrl.hostname;
    redirectUrl.port = canonicalUrl.port;

    return NextResponse.redirect(redirectUrl, 308);
  }

  const legacyHostnameRedirectUrl = resolveLegacyHostnameRedirectUrl({
    host: requestHost,
    pathname,
    search: request.nextUrl.search,
  });

  if (legacyHostnameRedirectUrl) {
    return withSeoHeaders(
      NextResponse.redirect(legacyHostnameRedirectUrl, 308),
      hostname,
      request
    );
  }

  const pullitProxyTarget = resolvePullitProxyTarget({
    hostname,
    pathname,
    search: request.nextUrl.search,
    origins: {
      frontend: process.env.PULLIT_FRONTEND_ORIGIN,
      backend: process.env.PULLIT_BACKEND_ORIGIN,
      docs: process.env.PULLIT_DOCS_ORIGIN,
    },
  });

  if (pullitProxyTarget) {
    return withSeoHeaders(
      NextResponse.rewrite(pullitProxyTarget),
      hostname,
      request
    );
  }

  const legacyServiceRedirectUrl = isSubdomainRewritePass
    ? null
    : resolveLegacyServicePathRedirectUrl({
        host: requestHost,
        pathname,
        search: request.nextUrl.search,
      });

  if (legacyServiceRedirectUrl) {
    return withSeoHeaders(
      NextResponse.redirect(legacyServiceRedirectUrl, 308),
      hostname,
      request
    );
  }

  const subdomainRewritePath = isSubdomainRewritePass
    ? null
    : resolveServiceSubdomainRewritePath({
        host: requestHost,
        pathname,
        search: request.nextUrl.search,
      });

  if (subdomainRewritePath) {
    const rewriteUrl = request.nextUrl.clone();
    const targetUrl = new URL(subdomainRewritePath, request.url);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(SUBDOMAIN_REWRITE_HEADER, "1");

    rewriteUrl.pathname = targetUrl.pathname;
    rewriteUrl.search = targetUrl.search;
    return withSeoHeaders(
      NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      }),
      hostname,
      request
    );
  }

  if (pathname.startsWith(`${COUNSELING_SERVICE_BASE_PATH}/api/`)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname.slice(COUNSELING_SERVICE_BASE_PATH.length);
    return withSeoHeaders(NextResponse.rewrite(rewriteUrl), hostname, request);
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
    return withSeoHeaders(
      NextResponse.redirect(redirectUrl),
      hostname,
      request
    );
  }

  return withSeoHeaders(NextResponse.next(), hostname, request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
