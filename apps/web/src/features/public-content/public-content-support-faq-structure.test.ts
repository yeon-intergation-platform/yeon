import { describe, expect, it } from "vitest";
import {
  PUBLIC_CONTENT_ARTICLES,
  PUBLIC_CONTENT_CHANNELS,
  type PublicContentArticle,
} from "./public-content-data";
import { hasPublicContentSupportFaqHeadingStructure } from "./public-content-support-faq-structure";

describe("public content support FAQ structure", () => {
  it("support FAQ 글은 색인 가능한 heading 구조를 가진다", () => {
    const faqArticles = PUBLIC_CONTENT_ARTICLES.filter(
      (item) =>
        item.channel === PUBLIC_CONTENT_CHANNELS.support &&
        item.category === "faq"
    );

    expect(faqArticles.length).toBeGreaterThan(0);
    expect(faqArticles.every(hasPublicContentSupportFaqHeadingStructure)).toBe(
      true
    );
  });

  it("heading이 없는 support FAQ 글은 정책 위반으로 판정한다", () => {
    const article: PublicContentArticle = {
      channel: PUBLIC_CONTENT_CHANNELS.support,
      service: "nexa",
      category: "faq",
      slugSegments: ["nexa", "faq", "no-heading"],
      title: "heading 없는 FAQ",
      description: "테스트용 FAQ",
      summary: "테스트용 FAQ",
      publishedAt: "2026-06-17",
      updatedAt: "2026-06-17",
      readingMinutes: 1,
      sourcePaths: ["test"],
      body: [
        {
          type: "paragraph",
          text: "본문",
        },
      ],
    };

    expect(hasPublicContentSupportFaqHeadingStructure(article)).toBe(false);
  });
});
