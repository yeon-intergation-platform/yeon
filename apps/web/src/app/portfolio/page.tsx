import { YeonStructuredData } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import {
  OwnerPortfolioPage,
  PORTFOLIO_DOCUMENTS,
  PORTFOLIO_EXTERNAL_LINKS,
  PORTFOLIO_PROFILE,
} from "@/features/owner-portfolio";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import { SITE_BRAND_NAME } from "@/lib/site-brand";

const title = "최현준 백엔드 개발자 포트폴리오";
const description =
  "최현준의 백엔드 프로젝트, 문제 해결 과정, 포트폴리오와 이력서를 확인하세요.";
const canonical = buildServiceCanonicalUrl("portfolio");

export const metadata: YeonPageMetadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    siteName: SITE_BRAND_NAME,
    type: "profile",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

function getPortfolioJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: title,
    url: canonical,
    description,
    mainEntity: {
      "@type": "Person",
      name: PORTFOLIO_PROFILE.name,
      alternateName: PORTFOLIO_PROFILE.nameEn,
      jobTitle: PORTFOLIO_PROFILE.role,
      url: canonical,
      sameAs: PORTFOLIO_EXTERNAL_LINKS.map((link) => link.href),
      subjectOf: PORTFOLIO_DOCUMENTS.map((document) => ({
        "@type": "DigitalDocument",
        name: document.label,
        url: buildServiceCanonicalUrl("portfolio", document.href),
      })),
    },
  };
}

export default function PortfolioPageRoute() {
  return (
    <>
      <YeonStructuredData
        id="owner-portfolio-jsonld"
        data={getPortfolioJsonLd()}
      />
      <OwnerPortfolioPage />
    </>
  );
}
