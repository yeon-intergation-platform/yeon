import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonScript } from "@yeon/ui";
import { createYeonGoogleAnalyticsBootstrapScript } from "@yeon/ui/runtime/YeonBrowserRuntime";
import type { ReactNode } from "react";
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

const GOOGLE_ANALYTICS_ID = "G-YGRNS3PQBQ";

export default function RootLayout({ children }: RootLayoutProps) {
  const shouldLoadGoogleAnalytics =
    isCanonicalDeployment() && GOOGLE_ANALYTICS_ID.length > 0;

  return (
    <html lang="ko">
      <body>
        {shouldLoadGoogleAnalytics ? (
          <>
            <YeonScript
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
              strategy="afterInteractive"
            />
            <YeonScript id="google-analytics" strategy="afterInteractive">
              {createYeonGoogleAnalyticsBootstrapScript(GOOGLE_ANALYTICS_ID)}
            </YeonScript>
            <GoogleAnalyticsPageTracker />
          </>
        ) : null}
        <CommunityPresenceTracker />
        {children}
      </body>
    </html>
  );
}
