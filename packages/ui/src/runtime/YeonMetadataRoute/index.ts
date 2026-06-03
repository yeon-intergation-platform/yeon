import type { MetadataRoute } from "next";

export type YeonRobotsMetadataRoute = MetadataRoute.Robots;
export type YeonSitemapMetadataRoute = MetadataRoute.Sitemap;

export type YeonMetadataRoute = {
  Robots: YeonRobotsMetadataRoute;
  Sitemap: YeonSitemapMetadataRoute;
};
