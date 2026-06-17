import {
  PUBLIC_CONTENT_CHANNELS,
  PublicContentArticlePage,
  getPublicContentArticleMetadata,
  getPublicContentStaticParams,
} from "@/features/public-content";

type SupportArticleRouteProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export function generateStaticParams() {
  return getPublicContentStaticParams(PUBLIC_CONTENT_CHANNELS.support);
}

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
