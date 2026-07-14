import {
  PUBLIC_CONTENT_CHANNELS,
  PublicContentHome,
  getPublicContentHomeMetadata,
} from "@/features/public-content";

export const metadata = getPublicContentHomeMetadata(
  PUBLIC_CONTENT_CHANNELS.support
);

type SupportHomePageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

function getSearchQuery(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SupportHomePage({
  searchParams,
}: SupportHomePageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <PublicContentHome
      channel={PUBLIC_CONTENT_CHANNELS.support}
      supportSearchQuery={getSearchQuery(resolvedSearchParams.q)}
    />
  );
}
