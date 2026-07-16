import { describe, expect, it } from "vitest";
import {
  PUBLIC_CONTENT_ARTICLES,
  PUBLIC_CONTENT_CHANNELS,
} from "./public-content-data";
import {
  PUBLIC_CONTENT_NEWS_HOME_CATEGORY_ORDER,
  getPublicContentNewsArticleContext,
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

  it("news category별 상단 맥락을 제공한다", () => {
    const noticeArticle = PUBLIC_CONTENT_ARTICLES.find(
      (article) =>
        article.channel === PUBLIC_CONTENT_CHANNELS.news &&
        article.category === "notice"
    );
    const updateArticle = PUBLIC_CONTENT_ARTICLES.find(
      (article) =>
        article.channel === PUBLIC_CONTENT_CHANNELS.news &&
        article.category === "updates"
    );
    const newsArticle = PUBLIC_CONTENT_ARTICLES.find(
      (article) =>
        article.channel === PUBLIC_CONTENT_CHANNELS.news &&
        article.category === "news"
    );
    const supportArticle = PUBLIC_CONTENT_ARTICLES.find(
      (article) => article.channel === PUBLIC_CONTENT_CHANNELS.support
    );

    expect(noticeArticle).toBeDefined();
    expect(updateArticle).toBeDefined();
    expect(newsArticle).toBeDefined();
    expect(supportArticle).toBeDefined();

    expect(
      getPublicContentNewsArticleContext(noticeArticle!)?.items.map(
        (item) => item.label
      )
    ).toEqual(["적용 서비스", "적용일"]);
    expect(
      getPublicContentNewsArticleContext(updateArticle!)?.items.map(
        (item) => item.label
      )
    ).toEqual(["변경 요약", "사용자 영향도"]);
    expect(
      getPublicContentNewsArticleContext(newsArticle!)?.items.map(
        (item) => item.label
      )
    ).toEqual(["관련 서비스", "YEON 관련성"]);
    expect(getPublicContentNewsArticleContext(supportArticle!)).toBeNull();
  });
});
