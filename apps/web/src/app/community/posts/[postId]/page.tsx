import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { CommunityPostDetailPage } from "@/features/community/community-post-detail-page";
import { parseCommunityPost } from "@/features/community/community-post-format";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import {
  ChatServiceFeedSpringBackendHttpError,
  fetchChatServiceFeedPostFromSpring,
} from "@/server/chat-service-feed-spring-client";
import { chatServiceFeedPostActionResponseSchema } from "@yeon/api-contract/chat-service";

const COMMUNITY_POST_DESCRIPTION_MAX_LENGTH = 150;

type CommunityPostDetailRouteProps = {
  params: Promise<{ postId: string }>;
};

const getCommunityPost = cache(async (postId: string) => {
  try {
    const response = await fetchChatServiceFeedPostFromSpring({ postId });
    return chatServiceFeedPostActionResponseSchema.parse(response).post;
  } catch (error) {
    if (
      error instanceof ChatServiceFeedSpringBackendHttpError &&
      error.status === 404
    ) {
      return null;
    }

    throw error;
  }
});

function buildDescription(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= COMMUNITY_POST_DESCRIPTION_MAX_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, COMMUNITY_POST_DESCRIPTION_MAX_LENGTH)}…`;
}

export async function generateMetadata({
  params,
}: CommunityPostDetailRouteProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await getCommunityPost(postId);

  if (!post) {
    return {
      title: `커뮤니티 글을 찾지 못했습니다 | ${SITE_BRAND_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const parsedPost = parseCommunityPost(post);
  const title = `${parsedPost.title} | YEON 커뮤니티`;
  const description = buildDescription(parsedPost.content);
  const canonical = `/community/posts/${post.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_BRAND_NAME,
      type: "article",
      locale: "ko_KR",
      publishedTime: post.createdAt,
      authors: [post.author.nickname],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function CommunityPostDetailRoute({
  params,
}: CommunityPostDetailRouteProps) {
  const { postId } = await params;
  const post = await getCommunityPost(postId);

  if (!post) {
    notFound();
  }

  return <CommunityPostDetailPage postId={postId} initialPost={post} />;
}
