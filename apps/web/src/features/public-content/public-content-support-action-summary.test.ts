import { describe, expect, it } from "vitest";
import {
  PUBLIC_CONTENT_ARTICLES,
  PUBLIC_CONTENT_CHANNELS,
  type PublicContentArticle,
} from "./public-content-data";
import {
  getPublicContentSupportPrimaryActionItems,
  hasPublicContentSupportFaqHeadingStructure,
} from "./public-content-support-action-summary";

describe("public content support action summary", () => {
  it("support 글의 첫 해결 단계에서 최대 3개 항목을 가져온다", () => {
    const article = PUBLIC_CONTENT_ARTICLES.find(
      (item) =>
        item.channel === PUBLIC_CONTENT_CHANNELS.support &&
        item.slugSegments.join("/") ===
          "nexa/troubleshooting/bot-not-responding"
    );

    expect(getPublicContentSupportPrimaryActionItems(article!)).toEqual([
      "다른 테스트 채널에서 같은 질문을 보내 봅니다.",
      "NEXA 봇 역할에 View Channel과 Send Messages 권한이 있는지 확인합니다.",
      "해당 채널의 권한 덮어쓰기에서 봇 역할이 차단되어 있지 않은지 확인합니다.",
    ]);
  });

  it("support가 아닌 글에는 해결 단계 요약을 만들지 않는다", () => {
    const article = PUBLIC_CONTENT_ARTICLES.find(
      (item) => item.channel === PUBLIC_CONTENT_CHANNELS.blog
    );

    expect(getPublicContentSupportPrimaryActionItems(article!)).toEqual([]);
  });

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
