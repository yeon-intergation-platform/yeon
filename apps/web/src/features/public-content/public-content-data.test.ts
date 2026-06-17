import { describe, expect, it } from "vitest";
import {
  PUBLIC_CONTENT_ARTICLES,
  PUBLIC_CONTENT_CHANNELS,
  buildPublicContentCanonicalUrl,
  getPublicContentCollectionBySlug,
  getPublicContentCollections,
  getPublicContentSitemapEntries,
  getPublicContentSupportCtaTarget,
} from "./public-content-data";

describe("public content data", () => {
  it("글이 있는 support 서비스와 분류만 collection으로 만든다", () => {
    const nexaCollection = getPublicContentCollectionBySlug("support", [
      "nexa",
    ]);
    const nexaGuidesCollection = getPublicContentCollectionBySlug("support", [
      "nexa",
      "guides",
    ]);

    expect(nexaCollection).toMatchObject({
      title: "NEXA 도움말",
      canonicalUrl: "https://support.yeon.world/nexa",
    });
    expect(nexaGuidesCollection).toMatchObject({
      title: "NEXA 가이드",
      canonicalUrl: "https://support.yeon.world/nexa/guides",
    });
    expect(nexaGuidesCollection?.articles.length).toBeGreaterThan(1);
    expect(
      getPublicContentCollectionBySlug("support", ["mooddesk"])
    ).toBeNull();
  });

  it("news와 blog collection은 실제 발행 글 기준으로 파생한다", () => {
    expect(
      getPublicContentCollectionBySlug("news", ["updates", "nexa"])
    ).toMatchObject({
      title: "NEXA 제품 업데이트",
      canonicalUrl: "https://news.yeon.world/updates/nexa",
    });

    expect(
      getPublicContentCollectionBySlug("blog", ["engineering"])
    ).toMatchObject({
      title: "기술 글",
      canonicalUrl: "https://blog.yeon.world/engineering",
    });

    expect(getPublicContentCollectionBySlug("blog", ["devlog"])).toMatchObject({
      title: "개발 일지",
      canonicalUrl: "https://blog.yeon.world/devlog",
    });
  });

  it("collection URL을 sitemap에 포함하고 빈 collection은 제외한다", () => {
    const sitemapUrls = getPublicContentSitemapEntries().map(
      (entry) => entry.url
    );

    expect(sitemapUrls).toContain(
      buildPublicContentCanonicalUrl("support", ["nexa", "guides"])
    );
    expect(sitemapUrls).toContain(
      buildPublicContentCanonicalUrl("news", ["updates", "nexa"])
    );
    expect(sitemapUrls).toContain(
      buildPublicContentCanonicalUrl("blog", ["engineering"])
    );
    expect(sitemapUrls).toContain(
      buildPublicContentCanonicalUrl("blog", ["devlog"])
    );

    expect(getPublicContentCollections("support").length).toBeGreaterThan(
      getPublicContentCollections("blog").length
    );
  });

  it("support 서비스 글은 서비스별 하단 CTA 정책을 따른다", () => {
    const supportArticles = PUBLIC_CONTENT_ARTICLES.filter(
      (article) => article.channel === PUBLIC_CONTENT_CHANNELS.support
    );

    supportArticles.forEach((article) => {
      const expectedCta = getPublicContentSupportCtaTarget(article.service);
      if (!expectedCta) return;

      expect(article).toMatchObject(expectedCta);
    });
  });
});
