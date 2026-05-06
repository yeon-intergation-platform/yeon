import type { Metadata } from "next";
import Script from "next/script";

import {
  CARD_SERVICE_FAQS,
  CARD_SERVICE_PAGE_DESCRIPTION,
  CARD_SERVICE_PAGE_TITLE,
  CARD_SERVICE_SEO_KEYWORDS,
  CardServiceHome,
} from "@/features/card-service";

export const metadata: Metadata = {
  title: CARD_SERVICE_PAGE_TITLE,
  description: CARD_SERVICE_PAGE_DESCRIPTION,
  keywords: [...CARD_SERVICE_SEO_KEYWORDS],
  alternates: {
    canonical: "/card-service",
  },
  openGraph: {
    title: CARD_SERVICE_PAGE_TITLE,
    description: CARD_SERVICE_PAGE_DESCRIPTION,
    url: "/card-service",
    type: "website",
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
        description: CARD_SERVICE_PAGE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "KRW",
        },
        url: "https://yeon.world/card-service",
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
      <Script
        id="card-service-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getCardServiceJsonLd()),
        }}
      />
      <CardServiceHome />
    </>
  );
}
