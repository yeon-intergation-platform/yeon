import {
  PUBLIC_CONTENT_CHANNELS,
  PublicContentArticlePage,
  getPublicContentArticleMetadata,
  getPublicContentStaticParams,
} from "@/features/public-content";

type BlogArticleRouteProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export function generateStaticParams() {
  return getPublicContentStaticParams(PUBLIC_CONTENT_CHANNELS.blog);
}

export async function generateMetadata({ params }: BlogArticleRouteProps) {
  return getPublicContentArticleMetadata({
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    params,
  });
}

export default async function BlogArticlePage({
  params,
}: BlogArticleRouteProps) {
  const { slug = [] } = await params;

  return (
    <PublicContentArticlePage
      channel={PUBLIC_CONTENT_CHANNELS.blog}
      slugSegments={slug}
    />
  );
}
