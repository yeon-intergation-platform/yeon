import type { YeonMetadataRoute } from "@yeon/ui/runtime/YeonMetadataRoute";
import { getIndexableSitemapEntries, isCanonicalDeployment } from "@/lib/seo";

export default function sitemap(): YeonMetadataRoute["Sitemap"] {
  if (!isCanonicalDeployment()) {
    return [];
  }

  return getIndexableSitemapEntries();
}
