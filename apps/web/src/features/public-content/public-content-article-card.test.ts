import { describe, expect, it } from "vitest";
import {
  getPublicContentArticleCardClassificationItems,
  getPublicContentArticleCardMetaItems,
  getPublicContentArticleCardPublicationItems,
} from "./public-content-article-card-meta";
import {
  PUBLIC_CONTENT_CHANNELS,
  getPublicContentArticles,
  getPublicContentCategoryLabel,
} from "./public-content-data";

describe("public content article card", () => {
  it("blog 카드는 분류, 날짜, 읽는 시간을 메타 정보로 보여준다", () => {
    const article = getPublicContentArticles(PUBLIC_CONTENT_CHANNELS.blog)[0];
    expect(article).toBeDefined();

    const metaItems = getPublicContentArticleCardMetaItems(article);

    expect(metaItems).toContain(
      getPublicContentCategoryLabel(article.category)
    );
    expect(metaItems).toContain(article.publishedAt);
    expect(metaItems).toContain(`${article.readingMinutes}분`);
  });

  it("카드 상단 분류와 하단 발행 정보의 위계를 분리한다", () => {
    const article = getPublicContentArticles(PUBLIC_CONTENT_CHANNELS.news)[0];
    expect(article).toBeDefined();

    expect(getPublicContentArticleCardClassificationItems(article)).toEqual([
      expect.any(String),
      getPublicContentCategoryLabel(article.category),
    ]);
    expect(getPublicContentArticleCardPublicationItems(article)).toEqual([
      article.publishedAt.replaceAll("-", "."),
      `${article.readingMinutes}분 읽기`,
    ]);
  });
});
