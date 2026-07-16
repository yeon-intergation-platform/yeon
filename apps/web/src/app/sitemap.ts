import type { YeonMetadataRoute } from "@yeon/ui/runtime/YeonMetadataRoute";
import { getYeonRequestHeaders } from "@yeon/ui/runtime/YeonServerRequest";
import { getIndexableSitemapEntriesForHostname } from "@/lib/seo";
import { normalizeRequestHostname } from "@/lib/request-host";
import { loadPublishedPublicContentArticles } from "@/features/public-content/public-content-runtime";
import { PUBLIC_CONTENT_CHANNEL_CONFIG } from "@/features/public-content/public-content-data";

export default async function sitemap(): Promise<YeonMetadataRoute["Sitemap"]> {
  const headerStore = await getYeonRequestHeaders();
  const hostname = normalizeRequestHostname(
    headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  );
  const publicContentHostname = Object.values(PUBLIC_CONTENT_CHANNEL_CONFIG)
    .map((config) => new URL(config.host).hostname)
    .includes(hostname);
  const articles = publicContentHostname
    ? await loadPublishedPublicContentArticles()
    : undefined;

  return getIndexableSitemapEntriesForHostname(hostname, articles);
}
