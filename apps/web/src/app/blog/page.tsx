import {
  PUBLIC_CONTENT_CHANNELS,
  PublicContentHome,
  getPublicContentBlogCategory,
  getPublicContentHomeMetadata,
} from "@/features/public-content";

export const metadata = getPublicContentHomeMetadata(
  PUBLIC_CONTENT_CHANNELS.blog
);

type BlogHomePageProps = {
  searchParams: Promise<{
    category?: string | string[];
  }>;
};

function getFirstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BlogHomePage({
  searchParams,
}: BlogHomePageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <PublicContentHome
      blogCategory={getPublicContentBlogCategory(
        getFirstValue(resolvedSearchParams.category)
      )}
      channel={PUBLIC_CONTENT_CHANNELS.blog}
    />
  );
}
