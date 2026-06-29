import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonStructuredData } from "@yeon/ui";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import { TodoServiceScreen } from "@/features/todo-service";

const TODO_SERVICE_TITLE = "YEON Today - 오늘 할 일 보드";
const TODO_SERVICE_DESCRIPTION =
  "오늘 처리할 일만 고르고 지금 할 일 하나에 집중하는 개인용 데일리 보드입니다.";

export const metadata: YeonPageMetadata = {
  title: TODO_SERVICE_TITLE,
  description: TODO_SERVICE_DESCRIPTION,
  alternates: {
    canonical: buildServiceCanonicalUrl("todo"),
  },
  openGraph: {
    title: TODO_SERVICE_TITLE,
    description: TODO_SERVICE_DESCRIPTION,
    url: buildServiceCanonicalUrl("todo"),
    siteName: SITE_BRAND_NAME,
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: TODO_SERVICE_TITLE,
    description: TODO_SERVICE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

function getTodoServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "YEON Today",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    inLanguage: "ko-KR",
    isAccessibleForFree: true,
    description: TODO_SERVICE_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
    url: buildServiceCanonicalUrl("todo"),
  };
}

export default function TodoServicePage() {
  return (
    <>
      <YeonStructuredData
        id="todo-service-jsonld"
        data={getTodoServiceJsonLd()}
      />
      <TodoServiceScreen />
    </>
  );
}
