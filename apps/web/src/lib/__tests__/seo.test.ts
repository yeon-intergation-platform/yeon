import { afterEach, describe, expect, it } from "vitest";
import {
  buildCanonicalUrl,
  buildServiceCanonicalUrl,
  getDefaultSiteRobots,
  getIndexableSitemapEntries,
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
    expect(getIndexableSitemapEntries()).toEqual([
      {
        url: "https://yeon.world/",
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        url: "https://typing.yeon.world",
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: "https://community.yeon.world",
        changeFrequency: "daily",
        priority: 0.85,
      },
      {
        url: "https://typing.yeon.world/rooms",
        changeFrequency: "daily",
        priority: 0.85,
      },
      {
        url: "https://typing.yeon.world/decks",
        changeFrequency: "daily",
        priority: 0.85,
      },
      {
        url: "https://card.yeon.world",
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: "https://yeon.world/privacy",
        changeFrequency: "yearly",
        priority: 0.2,
      },
      {
        url: "https://yeon.world/terms",
        changeFrequency: "yearly",
        priority: 0.2,
      },
    ]);
  });

  it("www와 dev 호스트를 별도 정책 대상으로 식별한다", () => {
    expect(isWwwHostname("www.yeon.world")).toBe(true);
    expect(isWwwHostname("yeon.world")).toBe(false);
    expect(isDevHostname("dev.yeon.world")).toBe(true);
    expect(isDevHostname("yeon.world")).toBe(false);
  });
});
