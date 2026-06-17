import { describe, expect, it } from "vitest";
import {
  buildPublicContentRssFeed,
  escapePublicContentRssText,
} from "./public-content-feed";

describe("public content RSS feed", () => {
  it("channel별 RSS XML을 생성한다", () => {
    const feed = buildPublicContentRssFeed("blog");

    expect(feed).toContain('<rss version="2.0"');
    expect(feed).toContain("<title>YEON Blog</title>");
    expect(feed).toContain(
      '<atom:link href="https://blog.yeon.world/feed.xml" rel="self" type="application/rss+xml" />'
    );
    expect(feed).toContain(
      "<link>https://blog.yeon.world/engineering/search-console-sitemap-operations</link>"
    );
    expect(feed).not.toContain("https://support.yeon.world/nexa/guides");
  });

  it("RSS XML 특수 문자를 escape한다", () => {
    expect(escapePublicContentRssText('<NEXA & "YEON">\'')).toBe(
      "&lt;NEXA &amp; &quot;YEON&quot;&gt;&apos;"
    );
  });
});
