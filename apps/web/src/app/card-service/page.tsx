import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonStructuredData } from "@yeon/ui";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import {
  CARD_SERVICE_FAQS,
  CARD_SERVICE_PAGE_DESCRIPTION,
  CARD_SERVICE_PAGE_TITLE,
  CARD_SERVICE_SEO_KEYWORDS,
  CardServiceHome,
} from "@/features/card-service";

export const metadata: YeonPageMetadata = {
  title: CARD_SERVICE_PAGE_TITLE,
  description: CARD_SERVICE_PAGE_DESCRIPTION,
  keywords: [...CARD_SERVICE_SEO_KEYWORDS],
  alternates: {
    canonical: buildServiceCanonicalUrl("card"),
  },
  openGraph: {
    title: CARD_SERVICE_PAGE_TITLE,
    description: CARD_SERVICE_PAGE_DESCRIPTION,
    url: buildServiceCanonicalUrl("card"),
    siteName: SITE_BRAND_NAME,
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: CARD_SERVICE_PAGE_TITLE,
    description: CARD_SERVICE_PAGE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
};

function getCardServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "YEON 플래시카드 학습",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        inLanguage: "ko-KR",
        isAccessibleForFree: true,
        description: CARD_SERVICE_PAGE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "KRW",
        },
        url: buildServiceCanonicalUrl("card"),
      },
      {
        "@type": "FAQPage",
        mainEntity: CARD_SERVICE_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
}

export default function CardServicePage() {
  return (
    <>
      <YeonStructuredData
        id="card-service-jsonld"
        data={getCardServiceJsonLd()}
      />
      <CardServiceHome />
    </>
  );
}
