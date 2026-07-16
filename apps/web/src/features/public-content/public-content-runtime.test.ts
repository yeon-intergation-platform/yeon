import { describe, expect, it } from "vitest";
import { toPublicContentArticle } from "./public-content-runtime";

describe("public content runtime adapter", () => {
  it("Spring 발행 DTO를 기존 공개 화면 모델로 변환한다", () => {
    const article = toPublicContentArticle({
      channel: "blog",
      serviceKey: "yeon",
      category: "engineering",
      slug: "engineering/markdown-cms",
      title: "Markdown CMS",
      description: "관리자 발행 글입니다.",
      summary: "발행본을 공개 모델로 변환합니다.",
      canonicalUrl: "https://blog.yeon.world/engineering/markdown-cms",
      publishedAt: "2026-07-16T00:00:00.000Z",
      updatedAt: "2026-07-16T01:00:00.000Z",
      readingMinutes: 2,
      bodyFormat: "markdown",
      bodyMarkdown: "## 시작\n\n본문입니다.",
      ctaLabel: null,
      ctaHref: null,
      metaTitle: "Markdown CMS 검색 제목",
      metaDescription: "검색 결과 설명입니다.",
      ogImageUrl: "https://cdn.yeon.world/public-content/markdown-cms.png",
    });

    expect(article.slugSegments).toEqual(["engineering", "markdown-cms"]);
    expect(article.bodyMarkdown).toBe("## 시작\n\n본문입니다.");
    expect(article.body[0]).toEqual({ type: "heading", title: "시작" });
    expect(article.metaTitle).toBe("Markdown CMS 검색 제목");
    expect(article.ogImageUrl).toBe(
      "https://cdn.yeon.world/public-content/markdown-cms.png"
    );
  });
});
