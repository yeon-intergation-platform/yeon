import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonStructuredData } from "@yeon/ui";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import {
  TYPING_PAGE_DESCRIPTION_EN,
  TYPING_PAGE_TITLE_EN,
  TYPING_SEO_KEYWORDS_EN,
  TypingServiceHome,
  getTypingServiceHelpContent,
} from "@/features/typing-service";
import { getCurrentAdminUser } from "@/server/auth/admin";

export const metadata: YeonPageMetadata = {
  title: TYPING_PAGE_TITLE_EN,
  description: TYPING_PAGE_DESCRIPTION_EN,
  keywords: [...TYPING_SEO_KEYWORDS_EN],
  alternates: {
    canonical: buildServiceCanonicalUrl("typing"),
  },
  openGraph: {
    title: TYPING_PAGE_TITLE_EN,
    description: TYPING_PAGE_DESCRIPTION_EN,
    url: buildServiceCanonicalUrl("typing"),
    siteName: SITE_BRAND_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TYPING_PAGE_TITLE_EN,
    description: TYPING_PAGE_DESCRIPTION_EN,
  },
};

function getTypingServiceJsonLd() {
  const helpContent = getTypingServiceHelpContent("en");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "YEON Typing",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        inLanguage: "en-US",
        isAccessibleForFree: true,
        description: TYPING_PAGE_DESCRIPTION_EN,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "KRW",
        },
        url: buildServiceCanonicalUrl("typing"),
      },
      {
        "@type": "FAQPage",
        mainEntity: helpContent.faqs.map((faq) => ({
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
      <YeonStructuredData
        id="typing-service-jsonld"
        data={getTypingServiceJsonLd()}
      />
      <TypingServiceHome showCharacterAdminLink={!!admin} />
    </>
  );
}
