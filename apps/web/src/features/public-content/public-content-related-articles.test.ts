import { describe, expect, it } from "vitest";
import { getPublicContentRelatedArticles } from "./public-content-related-articles";
import {
  getPublicContentArticleBySlug,
  type PublicContentArticle,
  type PublicContentChannel,
} from "./public-content-data";

function getArticle(
  channel: PublicContentChannel,
  slug: readonly string[]
): PublicContentArticle {
  const article = getPublicContentArticleBySlug(channel, slug);
  if (!article) {
    throw new Error(
      `테스트 article을 찾을 수 없습니다: ${channel}/${slug.join("/")}`
    );
  }

  return article;
}

describe("public content related articles", () => {
  it("같은 channel과 service의 다른 글만 최신순으로 반환한다", () => {
    const article = getArticle("support", [
      "nexa",
      "guides",
      "add-nexa-discord-bot",
    ]);
    const relatedArticles = getPublicContentRelatedArticles(article, 3);

    expect(relatedArticles.length).toBeGreaterThan(0);
    expect(
      relatedArticles.every(
        (relatedArticle) =>
          relatedArticle.channel === article.channel &&
          relatedArticle.service === article.service &&
          relatedArticle.slugSegments.join("/") !==
            article.slugSegments.join("/")
      )
    ).toBe(true);
    expect(
      relatedArticles.map((relatedArticle) => relatedArticle.publishedAt)
    ).toEqual(
      [...relatedArticles]
        .sort((left, right) =>
          right.publishedAt.localeCompare(left.publishedAt)
        )
        .map((relatedArticle) => relatedArticle.publishedAt)
    );
  });

  it("limit만큼만 반환한다", () => {
    const article = getArticle("support", [
      "nexa",
      "guides",
      "add-nexa-discord-bot",
    ]);

    expect(getPublicContentRelatedArticles(article, 1)).toHaveLength(1);
  });
});
