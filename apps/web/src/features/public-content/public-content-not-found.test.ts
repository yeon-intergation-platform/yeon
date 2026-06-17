import { describe, expect, it } from "vitest";
import {
  getPublicContentNotFoundArticles,
  getPublicContentNotFoundHomeLink,
} from "./public-content-not-found";

describe("public content not found", () => {
  it("channel 홈 링크를 만든다", () => {
    expect(getPublicContentNotFoundHomeLink("support")).toEqual({
      href: "https://support.yeon.world",
      label: "Support 홈으로 이동",
    });
  });

  it("해당 channel의 최신 글만 제한 개수로 반환한다", () => {
    const articles = getPublicContentNotFoundArticles("blog", 2);

    expect(articles).toHaveLength(2);
    expect(articles.every((article) => article.channel === "blog")).toBe(true);
    expect(articles[0].publishedAt >= articles[1].publishedAt).toBe(true);
  });
});
