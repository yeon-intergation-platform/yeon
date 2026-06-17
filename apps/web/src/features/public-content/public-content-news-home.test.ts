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
  it("news 홈은 notice, updates, news 순서로 섹션을 만든다", () => {
    const model = getPublicContentNewsHomeModel();

    expect(model.sections.map((section) => section.category)).toEqual(
      PUBLIC_CONTENT_NEWS_HOME_CATEGORY_ORDER
    );
    expect(model.sections.every((section) => section.articles.length > 0)).toBe(
      true
    );
    expect(model.sections[0]?.title).toBe("공식 공지");
    expect(model.sections[1]?.title).toBe("제품 업데이트");
    expect(model.sections[2]?.title).toBe("업계 뉴스 해설");
  });

  it("featured는 하나만 두고 업계 뉴스보다 공지와 업데이트를 우선한다", () => {
    const model = getPublicContentNewsHomeModel();

    expect(model.featuredArticle).not.toBeNull();
    expect(["notice", "updates"]).toContain(model.featuredArticle?.category);
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
