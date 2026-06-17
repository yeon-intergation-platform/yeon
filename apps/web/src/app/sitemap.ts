import type { YeonMetadataRoute } from "@yeon/ui/runtime/YeonMetadataRoute";
import { getYeonRequestHeaders } from "@yeon/ui/runtime/YeonServerRequest";
import { getIndexableSitemapEntriesForHostname } from "@/lib/seo";
import { normalizeRequestHostname } from "@/lib/request-host";

export default async function sitemap(): Promise<YeonMetadataRoute["Sitemap"]> {
  const headerStore = await getYeonRequestHeaders();
  const hostname = normalizeRequestHostname(
    headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  );

  return getIndexableSitemapEntriesForHostname(hostname);
}
