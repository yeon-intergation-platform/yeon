import { describe, expect, it } from "vitest";
import { getPublicContentNewsHomeModel } from "./public-content-news-home";

describe("public content news home", () => {
  it("news 홈은 실제 발행된 분류만 필터로 만든다", () => {
    const model = getPublicContentNewsHomeModel();

    expect(model.filters.map((filter) => filter.key)).toEqual([
      "all",
      "notice",
    ]);
    expect(model.filters[0]).toMatchObject({
      count: 1,
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
    expect(model.featuredArticle?.title).toBe(
      "YEON 공개 콘텐츠 화면을 정리했습니다"
    );
    expect(model.latestArticles).not.toContain(model.featuredArticle);
    expect(model.latestArticles).toHaveLength(0);
  });
});
