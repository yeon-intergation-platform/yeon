import { describe, expect, it } from "vitest";
import { getPublicContentBlogHomeModel } from "./public-content-blog-home";

describe("public content blog home", () => {
  it("blog 홈은 최신 글을 먼저 파생한다", () => {
    const model = getPublicContentBlogHomeModel();

    expect(model.latestArticles.length).toBeGreaterThan(0);
    expect(model.latestArticles.length).toBeLessThanOrEqual(4);
    expect(
      model.latestArticles.every((article) => article.channel === "blog")
    ).toBe(true);
  });

  it("blog 홈은 정책 분류 4개를 목적과 대표 글로 나눈다", () => {
    const model = getPublicContentBlogHomeModel();

    expect(
      model.categoryEntries.map((entry) => ({
        href: entry.href,
        key: entry.key,
        label: entry.label,
        purpose: entry.purpose,
      }))
    ).toEqual([
      {
        href: "https://blog.yeon.world/engineering",
        key: "engineering",
        label: "기술 글",
        purpose: "기술 선택과 구현 근거",
      },
      {
        href: "https://blog.yeon.world/product",
        key: "product",
        label: "제품 글",
        purpose: "사용자 문제와 제품 판단",
      },
      {
        href: "https://blog.yeon.world/devlog",
        key: "devlog",
        label: "개발 일지",
        purpose: "진행 상황과 배운 점",
      },
      {
        href: "https://blog.yeon.world/essay",
        key: "essay",
        label: "에세이",
        purpose: "짧은 개인 관점과 제품 철학",
      },
    ]);

    expect(
      model.categoryEntries.every(
        (entry) => entry.article.category === entry.key && entry.count > 0
      )
    ).toBe(true);
  });
});
