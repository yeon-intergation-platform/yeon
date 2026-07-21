import { Suspense } from "react";
import { YeonStructuredData } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";

import { TodayBoardScreen } from "@/features/today";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import { SITE_BRAND_NAME } from "@/lib/site-brand";

const TITLE = "YEON Today - 오늘 할 일 보드";
const DESCRIPTION =
  "오늘 끝낼 일을 계획하고 날짜별 진행률과 Inbox, 완료 기록을 관리합니다.";

export const metadata: YeonPageMetadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: buildServiceCanonicalUrl("todo") },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: buildServiceCanonicalUrl("todo"),
    siteName: SITE_BRAND_NAME,
    type: "website",
    locale: "ko_KR",
  },
};

export default function TodayPage() {
  return (
    <>
      <YeonStructuredData
        id="today-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "YEON Today",
          applicationCategory: "ProductivityApplication",
          operatingSystem: "Web",
          inLanguage: "ko-KR",
          isAccessibleForFree: true,
          description: DESCRIPTION,
          url: buildServiceCanonicalUrl("todo"),
        }}
      />
      <Suspense fallback={null}>
        <TodayBoardScreen />
      </Suspense>
    </>
  );
}
