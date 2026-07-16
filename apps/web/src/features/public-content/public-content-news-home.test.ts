import { describe, expect, it } from "vitest";
import {
  PUBLIC_CONTENT_NEWS_HOME_CATEGORY_ORDER,
  getPublicContentNewsHomeModel,
} from "./public-content-news-home";

describe("public content news home", () => {
  it("news 홈은 전체와 notice, updates, news 순서의 필터를 만든다", () => {
    const model = getPublicContentNewsHomeModel();

    expect(model.filters.map((filter) => filter.key)).toEqual([
      "all",
      ...PUBLIC_CONTENT_NEWS_HOME_CATEGORY_ORDER,
    ]);
    expect(model.filters[0]).toMatchObject({
      count: model.totalCount,
      href: "/news",
      label: "전체",
    });
    expect(model.filters.slice(1).every((filter) => filter.count > 0)).toBe(
      true
    );
  });

  it("featured는 공지를 우선하고 최신 소식 목록에서 중복하지 않는다", () => {
    const model = getPublicContentNewsHomeModel();

    expect(model.featuredArticle).not.toBeNull();
    expect(model.featuredArticle?.category).toBe("notice");
    expect(model.latestArticles).not.toContain(model.featuredArticle);
    expect(model.latestArticles.length).toBe(model.totalCount - 1);
  });
});
