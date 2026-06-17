import { describe, expect, it } from "vitest";
import { getPublicContentArticleCardMetaItems } from "./public-content-article-card-meta";
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
});
