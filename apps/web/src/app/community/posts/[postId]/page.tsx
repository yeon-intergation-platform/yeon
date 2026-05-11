import type { Metadata } from "next";

import { CommunityPostDetailPage } from "@/features/community/community-post-detail-page";

type CommunityPostDetailRouteProps = {
  params: Promise<{ postId: string }>;
};

export const metadata: Metadata = {
  title: "YEON 커뮤니티 글",
  alternates: {
    canonical: "/community",
  },
};

export default async function CommunityPostDetailRoute({
  params,
}: CommunityPostDetailRouteProps) {
  const { postId } = await params;
  return <CommunityPostDetailPage postId={postId} />;
}
