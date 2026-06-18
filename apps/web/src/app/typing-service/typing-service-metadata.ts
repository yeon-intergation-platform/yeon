import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import { SITE_BRAND_NAME } from "@/lib/site-brand";

type CreateTypingServiceMetadataOptions = {
  description: string;
  includeCanonical?: boolean;
  keywords?: readonly string[];
  path?: string;
  robots?: YeonPageMetadata["robots"];
  title: string;
};

export function createTypingServiceMetadata({
  description,
  includeCanonical = true,
  keywords,
  path,
  robots,
  title,
}: CreateTypingServiceMetadataOptions): YeonPageMetadata {
  const canonical = buildServiceCanonicalUrl("typing", path);
  const metadata: YeonPageMetadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_BRAND_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };

  if (includeCanonical) {
    metadata.alternates = {
      canonical,
    };
  }

  if (keywords) {
    metadata.keywords = [...keywords];
  }

  if (robots) {
    metadata.robots = robots;
  }

  return metadata;
}
