import {
  PUBLIC_CONTENT_CHANNELS,
  PublicContentArticlePage,
  getPublicContentArticleMetadata,
} from "@/features/public-content";

type NewsArticleRouteProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export async function generateMetadata({ params }: NewsArticleRouteProps) {
  return getPublicContentArticleMetadata({
    channel: PUBLIC_CONTENT_CHANNELS.news,
    params,
  });
}

export default async function NewsArticlePage({
  params,
}: NewsArticleRouteProps) {
  const { slug = [] } = await params;

  return (
    <PublicContentArticlePage
      channel={PUBLIC_CONTENT_CHANNELS.news}
      slugSegments={slug}
    />
  );
}
