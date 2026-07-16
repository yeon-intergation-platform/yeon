import { describe, expect, it } from "vitest";
import {
  getPublicContentChannelNavigationItems,
  getPublicContentCategoryNavItems,
  getPublicContentNewsTopicNavItems,
  getPublicContentServiceNavItems,
} from "./public-content-navigation";

describe("public content navigation", () => {
  it("채널 헤더 링크는 local과 dev에서 유지되는 내부 경로를 사용한다", () => {
    expect(getPublicContentChannelNavigationItems()).toEqual([
      { channel: "support", href: "/support", label: "Support" },
      { channel: "news", href: "/news", label: "News" },
      { channel: "blog", href: "/blog", label: "Blog" },
    ]);
  });

  it("support 홈 service nav는 실제 서비스 collection만 만든다", () => {
    const items = getPublicContentServiceNavItems({
      activeService: "nexa",
      channel: "support",
    });

    expect(items.map((item) => item.label)).toEqual([
      "NEXA",
      "타자연습",
      "플래시카드",
      "커뮤니티",
      "계정/정책",
    ]);
    expect(items[0]).toMatchObject({
      active: true,
      href: "/support/nexa",
      key: "nexa",
    });
    expect(items.every((item) => item.count > 0)).toBe(true);
  });

  it("support service collection의 category nav는 서비스 안의 분류만 만든다", () => {
    const items = getPublicContentCategoryNavItems({
      activeCategory: "faq",
      channel: "support",
      service: "nexa",
    });

    expect(items.map((item) => item.label)).toEqual([
      "가이드",
      "문제 해결",
      "FAQ",
      "정책",
    ]);
    expect(items.find((item) => item.key === "nexa/faq")).toMatchObject({
      active: true,
      href: "/support/nexa/faq",
      key: "nexa/faq",
    });
  });

  it("news와 blog 홈 category nav는 실제 발행된 collection만 만든다", () => {
    expect(
      getPublicContentCategoryNavItems({
        activeCategory: "notice",
        channel: "news",
      }).map((item) => ({
        active: item.active,
        href: item.href,
        label: item.label,
      }))
    ).toEqual([
      {
        active: true,
        href: "/news/notice",
        label: "공지",
      },
    ]);

    expect(
      getPublicContentCategoryNavItems({
        activeCategory: "engineering",
        channel: "blog",
      })[0]
    ).toMatchObject({
      active: true,
      href: "/blog/engineering",
      label: "기술 글",
    });
  });

  it("blog service nav는 parent category 안에서 링크 가능한 서비스만 만든다", () => {
    expect(
      getPublicContentServiceNavItems({
        channel: "blog",
        parentCategory: "product",
      }).map((item) => item.href)
    ).toEqual([
      "/blog/product/nexa",
      "/blog/product/card",
      "/blog/product/community",
    ]);
  });

  it("업계 뉴스 해설이 없으면 주제 필터도 만들지 않는다", () => {
    expect(
      getPublicContentServiceNavItems({
        channel: "news",
        parentCategory: "news",
      })
    ).toEqual([]);

    expect(
      getPublicContentNewsTopicNavItems({ activeTopic: "ai" }).map((item) => ({
        active: item.active,
        href: item.href,
        label: item.label,
      }))
    ).toEqual([]);
  });
});
