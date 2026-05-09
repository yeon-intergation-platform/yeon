import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Script from "next/script";

import { GoogleAnalyticsPageTracker } from "@/components/analytics/google-analytics-page-tracker";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { getDefaultSiteRobots, getSeoMetadataBase } from "@/lib/seo";
import { isCanonicalDeployment } from "@/lib/seo";
import {
  SITE_BRAND_NAME,
  SITE_DESCRIPTION,
  SITE_TITLE,
} from "@/lib/site-brand";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
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
  const analyticsEnabled = isCanonicalDeployment();

  return (
    <html lang="ko">
      <body>
        {analyticsEnabled ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
              `}
            </Script>
            <Suspense fallback={null}>
              <GoogleAnalyticsPageTracker />
            </Suspense>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
