export type YeonRobotsMetadataRoute = Record<string, unknown>;
export type YeonSitemapMetadataRoute = Array<Record<string, unknown>>;

export type YeonMetadataRoute = {
  Robots: YeonRobotsMetadataRoute;
  Sitemap: YeonSitemapMetadataRoute;
};
