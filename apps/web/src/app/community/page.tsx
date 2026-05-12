import type { Metadata } from "next";
import Script from "next/script";

import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { CANONICAL_SITE_URL } from "@/lib/seo";
import { CommunityPage } from "@/features/community/community-page";

export const metadata: Metadata = {
  title: "YEON 커뮤니티",
  description: "실시간 채팅과 커뮤니티 게시글을 함께 쓰는 공간입니다.",
  alternates: {
    canonical: "/community",
  },
  openGraph: {
    title: "YEON 커뮤니티",
    description: "실시간 채팅과 커뮤니티 게시글을 함께 쓰는 공간입니다.",
    url: "/community",
    siteName: SITE_BRAND_NAME,
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "YEON 커뮤니티",
    description: "실시간 채팅과 커뮤니티 게시글을 함께 쓰는 공간입니다.",
  },
};

function getCommunityJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE_BRAND_NAME} 커뮤니티`,
    url: new URL("/community", CANONICAL_SITE_URL).toString(),
    description: "실시간 채팅과 커뮤니티 게시글을 함께 쓰는 공간",
    mainEntity: {
      "@type": "CreativeWork",
      name: "커뮤니티 게시판",
    },
  };
}

export default function CommunityPageRoute() {
  return (
    <>
      <Script
        id="community-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getCommunityJsonLd()),
        }}
      />
      <CommunityPage />
    </>
  );
}
