import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonScript } from "@yeon/ui";
import { createYeonGoogleAnalyticsBootstrapScript } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { Suspense, type ReactNode } from "react";
import { GoogleAnalyticsPageTracker } from "@/components/analytics/google-analytics-page-tracker";
import { CommunityPresenceTracker } from "@/features/community/components/community-presence-tracker";
import {
  getDefaultSiteRobots,
  getSeoMetadataBase,
  isCanonicalDeployment,
} from "@/lib/seo";
import {
  SITE_BRAND_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_TITLE,
} from "@/lib/site-brand";
import { GA_MEASUREMENT_ID } from "@/lib/analytics-constants";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "./globals.css";

export const metadata: YeonPageMetadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  metadataBase: getSeoMetadataBase(),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_BRAND_NAME,
    type: "website",
    url: "/",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: getDefaultSiteRobots(),
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? "",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  const shouldLoadGoogleAnalytics =
    isCanonicalDeployment() && GA_MEASUREMENT_ID.length > 0;

  return (
    <html lang="ko">
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
        <CommunityPresenceTracker />
        {children}
      </body>
    </html>
  );
}
