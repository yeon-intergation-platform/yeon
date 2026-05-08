import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";

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

export const metadata: Metadata = {
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

const GOOGLE_ANALYTICS_ID = "G-YGRNS3PQBQ";

export default function RootLayout({ children }: RootLayoutProps) {
  const shouldLoadGoogleAnalytics =
    isCanonicalDeployment() && GOOGLE_ANALYTICS_ID.length > 0;

  return (
    <html lang="ko">
      <body>
        {shouldLoadGoogleAnalytics ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GOOGLE_ANALYTICS_ID}');
              `}
            </Script>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
