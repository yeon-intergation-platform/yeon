import { describe, expect, it } from "vitest";
import {
  buildPublicContentBlogCategoryFilterHref,
  getPublicContentBlogCategory,
  getPublicContentBlogHomeModel,
} from "./public-content-blog-home";

describe("public content blog home", () => {
  it("blog 홈은 최신 글을 먼저 파생한다", () => {
    const model = getPublicContentBlogHomeModel();

    expect(model.articleCount).toBeGreaterThanOrEqual(
      model.visibleArticles.length
    );
    expect(model.visibleArticles.length).toBeGreaterThan(0);
    expect(model.visibleArticles.length).toBeLessThanOrEqual(4);
    expect(
      model.visibleArticles.every((article) => article.channel === "blog")
    ).toBe(true);
  });

  it("blog 홈은 정책 분류 4개를 목적과 문서 수로 나눈다", () => {
    const model = getPublicContentBlogHomeModel();

    expect(
      model.categoryEntries.map((entry) => ({
        key: entry.key,
        label: entry.label,
        purpose: entry.purpose,
      }))
    ).toEqual([
      {
        key: "engineering",
        label: "기술 글",
        purpose: "기술 선택과 구현 근거",
      },
      {
        key: "product",
        label: "제품 글",
        purpose: "사용자 문제와 제품 판단",
      },
      {
        key: "devlog",
        label: "개발 일지",
        purpose: "진행 상황과 배운 점",
      },
      {
        key: "essay",
        label: "에세이",
        purpose: "짧은 개인 관점과 제품 철학",
      },
    ]);

    expect(model.categoryEntries.every((entry) => entry.count > 0)).toBe(true);
  });

  it("카테고리는 URL 상태로 검증하고 같은 홈 목록을 필터링한다", () => {
    const allModel = getPublicContentBlogHomeModel();
    const productCategory = getPublicContentBlogCategory("product");
    const productModel = getPublicContentBlogHomeModel(productCategory);
    const productEntry = allModel.categoryEntries.find(
      (entry) => entry.key === "product"
    );

    expect(productCategory).toBe("product");
    expect(getPublicContentBlogCategory("unknown")).toBeUndefined();
    expect(
      buildPublicContentBlogCategoryFilterHref({ category: productCategory })
    ).toBe("/blog?category=product");
    expect(
      buildPublicContentBlogCategoryFilterHref({
        pathname: "/blog",
        searchParams: "source=header&category=product",
      })
    ).toBe("/blog?source=header");

    expect(productModel.activeCategory).toBe("product");
    expect(productModel.articleCount).toBe(productEntry?.count);
    expect(productModel.visibleArticles).toHaveLength(
      productModel.articleCount
    );
    expect(
      productModel.visibleArticles.every(
        (article) => article.category === "product"
      )
    ).toBe(true);
  });
});
