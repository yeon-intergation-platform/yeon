import type { Metadata } from "next";
import Script from "next/script";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import {
  TYPING_FAQS,
  TYPING_PAGE_DESCRIPTION,
  TYPING_PAGE_TITLE,
  TYPING_SEO_KEYWORDS,
  TypingServiceHome,
} from "@/features/typing-service";
import { getCurrentAdminUser } from "@/server/auth/admin";

export const metadata: Metadata = {
  title: TYPING_PAGE_TITLE,
  description: TYPING_PAGE_DESCRIPTION,
  keywords: [...TYPING_SEO_KEYWORDS],
  alternates: {
    canonical: buildServiceCanonicalUrl("typing"),
  },
  openGraph: {
    title: TYPING_PAGE_TITLE,
    description: TYPING_PAGE_DESCRIPTION,
    url: buildServiceCanonicalUrl("typing"),
    siteName: SITE_BRAND_NAME,
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: TYPING_PAGE_TITLE,
    description: TYPING_PAGE_DESCRIPTION,
  },
};

function getTypingServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "YEON 타자연습",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        inLanguage: "ko-KR",
        isAccessibleForFree: true,
        description: TYPING_PAGE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "KRW",
        },
        url: buildServiceCanonicalUrl("typing"),
      },
      {
        "@type": "FAQPage",
        mainEntity: TYPING_FAQS.map((faq) => ({
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

export default async function TypingServicePage() {
  const admin = await getCurrentAdminUser();

  return (
    <>
      <Script
        id="typing-service-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getTypingServiceJsonLd()),
        }}
      />
      <TypingServiceHome showCharacterAdminLink={!!admin} />
    </>
  );
}
