import type { Metadata } from "next";
import Script from "next/script";

import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import { CommunityPage } from "@/features/community/community-page";
import {
  CommunitySeoSection,
  type CommunitySeoPost,
} from "@/features/community/community-seo-section";
import { parseCommunityPost } from "@/features/community/community-post-format";
import { fetchChatServiceFeedFromSpring } from "@/server/chat-service-feed-spring-client";

export const metadata: Metadata = {
  title: "YEON 커뮤니티",
  description: "실시간 채팅과 커뮤니티 게시글을 함께 쓰는 공간입니다.",
  alternates: {
    canonical: buildServiceCanonicalUrl("community"),
  },
  openGraph: {
    title: "YEON 커뮤니티",
    description: "실시간 채팅과 커뮤니티 게시글을 함께 쓰는 공간입니다.",
    url: buildServiceCanonicalUrl("community"),
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
    url: buildServiceCanonicalUrl("community"),
    description: "실시간 채팅과 커뮤니티 게시글을 함께 쓰는 공간",
    mainEntity: {
      "@type": "CreativeWork",
      name: "커뮤니티 게시판",
    },
  };
}

const MAX_SEO_POSTS = 8;
const MAX_SEO_CONTENT_LENGTH = 140;

// 크롤러용 최근 글을 서버에서 미리 가져와 파싱한다. 백엔드 실패 시에도 페이지가 깨지지 않도록
// 빈 배열로 graceful degrade 한다(소개·게시판 분류는 정적으로 계속 노출).
async function loadRecentCommunityPosts(): Promise<CommunitySeoPost[]> {
  try {
    const data = await fetchChatServiceFeedFromSpring();
    const posts = Array.isArray(data?.posts) ? data.posts : [];
    const result: CommunitySeoPost[] = [];

    for (const raw of posts) {
      if (!raw || typeof raw !== "object") continue;
      const record = raw as Record<string, unknown>;
      if (typeof record.body !== "string") continue;
      if (record.replyToPostId != null) continue; // 답글 제외, 루트 글만 노출

      const { category, title, content } = parseCommunityPost({
        body: record.body,
      });
      result.push({
        category,
        title,
        content: content.slice(0, MAX_SEO_CONTENT_LENGTH),
      });

      if (result.length >= MAX_SEO_POSTS) break;
    }

    return result;
  } catch {
    return [];
  }
}

export default async function CommunityPageRoute() {
  const recentPosts = await loadRecentCommunityPosts();

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
      <CommunitySeoSection recentPosts={recentPosts} />
    </>
  );
}
