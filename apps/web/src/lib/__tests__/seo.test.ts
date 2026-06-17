import { afterEach, describe, expect, it } from "vitest";
import {
  buildCanonicalUrl,
  buildSitemapUrlForHostname,
  buildServiceCanonicalUrl,
  getDefaultSiteRobots,
  getIndexableSitemapEntries,
  getIndexableSitemapEntriesForHostname,
  getRobotsForHostname,
  isCanonicalDeployment,
  isDevHostname,
  isWwwHostname,
} from "../seo";

describe("seo", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    if (originalAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
      return;
    }

    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  });

  it("루트 canonical url은 yeon.world를 기준으로 만든다", () => {
    expect(buildCanonicalUrl("/privacy")).toBe("https://yeon.world/privacy");
  });

  it("서비스 canonical url은 서비스 subdomain을 기준으로 만든다", () => {
    expect(buildServiceCanonicalUrl("typing")).toBe(
      "https://typing.yeon.world/"
    );
    expect(buildServiceCanonicalUrl("typing", "/rooms")).toBe(
      "https://typing.yeon.world/rooms"
    );
    expect(buildServiceCanonicalUrl("card")).toBe("https://card.yeon.world/");
    expect(buildServiceCanonicalUrl("community")).toBe(
      "https://community.yeon.world/"
    );
  });

  it("운영 호스트일 때만 canonical deployment로 본다", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://yeon.world";
    expect(isCanonicalDeployment()).toBe(true);

    process.env.NEXT_PUBLIC_APP_URL = "https://dev.yeon.world";
    expect(isCanonicalDeployment()).toBe(false);
  });

  it("비운영 deployment는 기본 robots를 noindex로 둔다", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://dev.yeon.world";

    expect(getDefaultSiteRobots()).toMatchObject({
      index: false,
      follow: false,
    });
  });

  it("운영 sitemap은 공개 index 대상만 반환한다", () => {
    expect(getIndexableSitemapEntries()).toEqual(
      expect.arrayContaining([
        {
          url: "https://yeon.world/",
          changeFrequency: "weekly",
          priority: 1,
          lastModified: undefined,
        },
        {
          url: "https://typing.yeon.world",
          changeFrequency: "daily",
          priority: 0.9,
          lastModified: undefined,
        },
        {
          url: "https://community.yeon.world",
          changeFrequency: "daily",
          priority: 0.85,
          lastModified: undefined,
        },
        {
          url: "https://support.yeon.world",
          changeFrequency: "weekly",
          priority: 0.7,
          lastModified: undefined,
        },
        {
          url: "https://news.yeon.world",
          changeFrequency: "weekly",
          priority: 0.7,
          lastModified: undefined,
        },
        {
          url: "https://blog.yeon.world",
          changeFrequency: "weekly",
          priority: 0.7,
          lastModified: undefined,
        },
        expect.objectContaining({
          url: "https://support.yeon.world/nexa/guides/add-nexa-discord-bot",
          changeFrequency: "monthly",
          priority: 0.65,
          lastModified: "2026-06-17",
        }),
        expect.objectContaining({
          url: "https://support.yeon.world/nexa/guides",
          changeFrequency: "weekly",
          priority: 0.6,
          lastModified: "2026-06-17",
        }),
        expect.objectContaining({
          url: "https://news.yeon.world/updates/nexa",
          changeFrequency: "weekly",
          priority: 0.6,
          lastModified: "2026-06-17",
        }),
        expect.objectContaining({
          url: "https://blog.yeon.world/product/why-split-support-news-blog",
          changeFrequency: "weekly",
          priority: 0.55,
          lastModified: "2026-06-17",
        }),
        expect.objectContaining({
          url: "https://blog.yeon.world/engineering",
          changeFrequency: "weekly",
          priority: 0.6,
          lastModified: "2026-06-17",
        }),
      ])
    );
  });

  it("host별 sitemap은 해당 canonical host URL만 반환한다", () => {
    expect(getIndexableSitemapEntriesForHostname("yeon.world")).toEqual([
      {
        url: "https://yeon.world/",
        changeFrequency: "weekly",
        priority: 1,
        lastModified: undefined,
      },
      {
        url: "https://yeon.world/privacy",
        changeFrequency: "yearly",
        priority: 0.2,
        lastModified: undefined,
      },
      {
        url: "https://yeon.world/terms",
        changeFrequency: "yearly",
        priority: 0.2,
        lastModified: undefined,
      },
    ]);

    expect(getIndexableSitemapEntriesForHostname("typing.yeon.world")).toEqual([
      {
        url: "https://typing.yeon.world",
        changeFrequency: "daily",
        priority: 0.9,
        lastModified: undefined,
      },
      {
        url: "https://typing.yeon.world/rooms",
        changeFrequency: "daily",
        priority: 0.85,
        lastModified: undefined,
      },
      {
        url: "https://typing.yeon.world/decks",
        changeFrequency: "daily",
        priority: 0.85,
        lastModified: undefined,
      },
    ]);

    const supportEntries =
      getIndexableSitemapEntriesForHostname("support.yeon.world");

    expect(supportEntries).toEqual(
      expect.arrayContaining([
        {
          url: "https://support.yeon.world",
          changeFrequency: "weekly",
          priority: 0.7,
          lastModified: undefined,
        },
        expect.objectContaining({
          url: "https://support.yeon.world/nexa/guides/add-nexa-discord-bot",
        }),
        expect.objectContaining({
          url: "https://support.yeon.world/nexa/guides",
        }),
      ])
    );
    expect(
      supportEntries.every((entry) =>
        entry.url.startsWith("https://support.yeon.world")
      )
    ).toBe(true);

    expect(getIndexableSitemapEntriesForHostname("dev.yeon.world")).toEqual([]);
  });

  it("host별 robots는 sitemap과 noindex 정책을 분리한다", () => {
    expect(getRobotsForHostname("typing.yeon.world")).toMatchObject({
      sitemap: "https://typing.yeon.world/sitemap.xml",
      host: "https://typing.yeon.world",
      rules: {
        userAgent: "*",
        allow: "/",
      },
    });

    expect(getRobotsForHostname("dev.yeon.world")).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });

    expect(buildSitemapUrlForHostname("card.yeon.world")).toBe(
      "https://card.yeon.world/sitemap.xml"
    );

    expect(getRobotsForHostname("support.yeon.world")).toMatchObject({
      sitemap: "https://support.yeon.world/sitemap.xml",
      host: "https://support.yeon.world",
      rules: {
        userAgent: "*",
        allow: "/",
      },
    });
  });

  it("www와 dev 호스트를 별도 정책 대상으로 식별한다", () => {
    expect(isWwwHostname("www.yeon.world")).toBe(true);
    expect(isWwwHostname("yeon.world")).toBe(false);
    expect(isDevHostname("dev.yeon.world")).toBe(true);
    expect(isDevHostname("yeon.world")).toBe(false);
  });
});
