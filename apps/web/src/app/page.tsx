import { YeonStructuredData } from "@yeon/ui";
import { createYeonUrlSearchParams } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { redirectYeon } from "@yeon/ui/runtime/YeonRouteControl";
import {
  getYeonRequestCookies,
  getYeonRequestHeaders,
} from "@yeon/ui/runtime/YeonServerRequest";
import { LandingHome } from "@/features/landing-home";
import {
  AUTH_SESSION_COOKIE_NAME,
  buildAuthSessionCleanupHref,
  normalizeAuthRedirectPath,
} from "@/server/auth/constants";
import {
  getRequestHostnameFromHostHeader,
  listDevLoginOptions,
} from "@/server/auth/dev-login";
import { getCurrentAuthUser } from "@/server/auth/session";
import {
  PLATFORM_HOME_HREF,
  getPlatformServices,
  getPlatformServicesForRequest,
} from "@/lib/platform-services";
import { SITE_BRAND_NAME, SITE_SUPPORT_EMAIL } from "@/lib/site-brand";

type HomePageProps = {
  searchParams: Promise<{
    next?: string | string[];
    login?: string | string[];
  }>;
};

function pickFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildHomeRedirectPath(options: {
  nextPath: string;
  hasNextPath: boolean;
  openLoginModalOnLoad: boolean;
}) {
  const searchParams = createYeonUrlSearchParams();

  if (options.openLoginModalOnLoad) {
    searchParams.set("login", "1");
  }

  if (options.hasNextPath) {
    searchParams.set("next", options.nextPath);
  }

  const query = searchParams.toString();

  return query ? `/?${query}` : "/";
}

function buildServicePublicUrl(href: string) {
  return href.startsWith("http") ? href : `https://yeon.world${href}`;
}

function getHomeJsonLd() {
  const services = getPlatformServices();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_BRAND_NAME,
        url: "https://yeon.world",
        inLanguage: "ko-KR",
        description:
          "타자연습, 플래시카드 학습, 커뮤니티를 한곳에서 운영하는 멀티 서비스 플랫폼",
      },
      {
        "@type": "Organization",
        name: SITE_BRAND_NAME,
        url: "https://yeon.world",
        email: SITE_SUPPORT_EMAIL,
      },
      {
        "@type": "CollectionPage",
        name: `${SITE_BRAND_NAME} 서비스 목록`,
        url: "https://yeon.world/",
        mainEntity: {
          "@type": "ItemList",
          itemListElement: services.map((service, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: service.title,
            url: buildServicePublicUrl(service.publicHref),
            description: service.summary,
          })),
        },
      },
    ],
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const requestedNextPath = pickFirstValue(resolvedSearchParams.next);
  const nextPath = normalizeAuthRedirectPath(requestedNextPath);
  const hasRequestedNextPath = !!requestedNextPath;
  const requestedLoginModalOpen =
    pickFirstValue(resolvedSearchParams.login) === "1";
  const cookieStore = await getYeonRequestCookies();
  const headerStore = await getYeonRequestHeaders();
  const hasSessionCookie =
    cookieStore.getAll(AUTH_SESSION_COOKIE_NAME).length > 0;
  const currentUser = await getCurrentAuthUser();
  const openLoginModalOnLoad = requestedLoginModalOpen && !currentUser;

  if (currentUser && hasRequestedNextPath) {
    redirectYeon(nextPath);
  }

  if (hasSessionCookie && !currentUser) {
    redirectYeon(
      buildAuthSessionCleanupHref(
        buildHomeRedirectPath({
          nextPath,
          hasNextPath: hasRequestedNextPath,
          openLoginModalOnLoad,
        })
      )
    );
  }

  const requestHostname = getRequestHostnameFromHostHeader(
    headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  );
  const devLoginOptions = await listDevLoginOptions(requestHostname);
  const entryServices = getPlatformServicesForRequest(requestHostname);

  return (
    <>
      <YeonStructuredData id="home-jsonld" data={getHomeJsonLd()} />
      <LandingHome
        nextPath={hasRequestedNextPath ? nextPath : PLATFORM_HOME_HREF}
        initialLoginModalOpen={openLoginModalOnLoad}
        devLoginOptions={devLoginOptions}
        services={entryServices}
        isAuthenticated={!!currentUser}
      />
    </>
  );
}
