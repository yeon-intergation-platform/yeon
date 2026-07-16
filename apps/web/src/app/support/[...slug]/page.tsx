import {
  PUBLIC_CONTENT_CHANNELS,
  PublicContentArticlePage,
  getPublicContentArticleMetadata,
} from "@/features/public-content";

type SupportArticleRouteProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export async function generateMetadata({ params }: SupportArticleRouteProps) {
  return getPublicContentArticleMetadata({
    channel: PUBLIC_CONTENT_CHANNELS.support,
    params,
  });
}

export default async function SupportArticlePage({
  params,
}: SupportArticleRouteProps) {
  const { slug = [] } = await params;

  return (
    <PublicContentArticlePage
      channel={PUBLIC_CONTENT_CHANNELS.support}
      slugSegments={slug}
    />
  );
}
