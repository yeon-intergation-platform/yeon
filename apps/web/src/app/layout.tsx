import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonScript } from "@yeon/ui";
import { createYeonGoogleAnalyticsBootstrapScript } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { Suspense, type ReactNode } from "react";
import { GoogleAnalyticsPageTracker } from "@/components/analytics/google-analytics-page-tracker";
import { PlatformLanguageDocumentSync } from "@/components/platform-language-document-sync";
import { CommunityPresenceTracker } from "@/features/community/components/community-presence-tracker";
import {
  getDefaultSiteRobots,
  getSeoMetadataBase,
  isCanonicalDeployment,
} from "@/lib/seo";
import { getSiteBrandText, SITE_BRAND_NAME } from "@/lib/site-brand";
import { resolvePlatformLanguageFromRequest } from "@/lib/platform-language-server";
import { GA_MEASUREMENT_ID } from "@/lib/analytics-constants";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "./globals.css";

export async function generateMetadata(): Promise<YeonPageMetadata> {
  const language = await resolvePlatformLanguageFromRequest();
  const siteText = getSiteBrandText(language);

  return {
    title: siteText.title,
    description: siteText.description,
    keywords: [...siteText.keywords],
    metadataBase: getSeoMetadataBase(),
    alternates: {
      canonical: "/",
      languages: {
        ko: "/?lang=ko",
        en: "/?lang=en",
      },
    },
    openGraph: {
      title: siteText.title,
      description: siteText.description,
      siteName: SITE_BRAND_NAME,
      type: "website",
      url: "/",
      locale: siteText.openGraphLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: siteText.title,
      description: siteText.description,
    },
    robots: getDefaultSiteRobots(),
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION ?? "",
      // 네이버 서치어드바이저 사이트 소유확인(yeon.world). 공개 토큰이라 커밋해도 안전하며,
      // env(NAVER_SITE_VERIFICATION)로 덮어쓸 수 있다. <head>에 naver-site-verification 메타로 출력된다.
      other: {
        "naver-site-verification":
          process.env.NAVER_SITE_VERIFICATION ??
          "f1621a2cd36bfabefa595b65d8a3c2460ffffe2a",
      },
    },
  };
}

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const language = await resolvePlatformLanguageFromRequest();
  const shouldLoadGoogleAnalytics =
    isCanonicalDeployment() && GA_MEASUREMENT_ID.length > 0;

  return (
    <html lang={language}>
      <body>
        {shouldLoadGoogleAnalytics ? (
          <>
            <YeonScript
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <YeonScript id="google-analytics" strategy="afterInteractive">
              {createYeonGoogleAnalyticsBootstrapScript(GA_MEASUREMENT_ID)}
            </YeonScript>
            <Suspense fallback={null}>
              <GoogleAnalyticsPageTracker />
            </Suspense>
          </>
        ) : null}
        <PlatformLanguageDocumentSync />
        <CommunityPresenceTracker />
        {children}
      </body>
    </html>
  );
}
