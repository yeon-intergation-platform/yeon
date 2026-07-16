import { describe, expect, it } from "vitest";
import {
  PUBLIC_CONTENT_ARTICLES,
  PUBLIC_CONTENT_CHANNELS,
} from "./public-content-data";
import {
  getPublicContentNewsDetailSections,
  hasPublicContentNewsDetailSections,
} from "./public-content-news-detail";

const NEWS_DETAIL_REQUIRED_TITLES = {
  news: ["YEON 서비스와의 관련성", "관련 blog 글"],
  notice: ["무엇이 바뀌었나요", "사용자에게 영향이 있나요", "필요한 조치"],
  updates: ["변경 전", "변경 후", "관련 support 문서"],
} as const;

describe("public content news detail", () => {
  it("notice detail은 변경/영향/조치 섹션을 제공한다", () => {
    const noticeArticles = PUBLIC_CONTENT_ARTICLES.filter(
      (article) =>
        article.channel === PUBLIC_CONTENT_CHANNELS.news &&
        article.category === "notice"
    );

    expect(noticeArticles.length).toBeGreaterThan(0);
    noticeArticles.forEach((article) => {
      expect(
        hasPublicContentNewsDetailSections(
          article,
          NEWS_DETAIL_REQUIRED_TITLES.notice
        )
      ).toBe(true);
    });
  });

  it("updates detail은 변경 전후와 관련 support 문서를 제공한다", () => {
    const updateArticles = PUBLIC_CONTENT_ARTICLES.filter(
      (article) =>
        article.channel === PUBLIC_CONTENT_CHANNELS.news &&
        article.category === "updates"
    );

    expect(updateArticles.length).toBeGreaterThan(0);
    updateArticles.forEach((article) => {
      const sections = getPublicContentNewsDetailSections(article);
      expect(
        hasPublicContentNewsDetailSections(
          article,
          NEWS_DETAIL_REQUIRED_TITLES.updates
        )
      ).toBe(true);
      expect(
        sections
          .find((section) => section.title === "관련 support 문서")
          ?.links?.some((link) => link.href.startsWith("/support"))
      ).toBe(true);
    });
  });

  it("업계 뉴스 detail은 관련 blog 글을 제공한다", () => {
    const industryNewsArticles = PUBLIC_CONTENT_ARTICLES.filter(
      (article) =>
        article.channel === PUBLIC_CONTENT_CHANNELS.news &&
        article.category === "news"
    );

    expect(industryNewsArticles.length).toBeGreaterThan(0);
    industryNewsArticles.forEach((article) => {
      const sections = getPublicContentNewsDetailSections(article);
      expect(
        hasPublicContentNewsDetailSections(
          article,
          NEWS_DETAIL_REQUIRED_TITLES.news
        )
      ).toBe(true);
      expect(
        sections
          .find((section) => section.title === "관련 blog 글")
          ?.links?.some((link) => link.href.startsWith("/blog"))
      ).toBe(true);
    });
  });
});
