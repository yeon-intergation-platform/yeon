import { describe, expect, it } from "vitest";
import {
  PUBLIC_CONTENT_ARTICLES,
  PUBLIC_CONTENT_CHANNELS,
  PUBLIC_CONTENT_SERVICES,
  type PublicContentArticle,
} from "./public-content-data";
import {
  getPublicContentNewsEditorialWarnings,
  hasPublicContentExternalReferenceLink,
} from "./public-content-news-editorial-quality";

function buildIndustryNewsArticle(
  overrides: Partial<PublicContentArticle> = {}
): PublicContentArticle {
  return {
    body: [
      {
        type: "paragraph",
        text: "외부 소식은 짧게 요약하고 사용자 영향만 해설합니다.",
      },
      {
        type: "links",
        title: "참고 출처",
        links: [
          {
            href: "https://example.com/source",
            label: "외부 출처",
          },
        ],
      },
    ],
    category: "news",
    channel: PUBLIC_CONTENT_CHANNELS.news,
    description: "외부 소식을 사용자 관점으로 해설합니다.",
    publishedAt: "2026-06-17",
    readingMinutes: 3,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    slugSegments: ["news", "ai", "example"],
    sourcePaths: ["https://example.com/source"],
    summary: "짧은 요약입니다.",
    title: "외부 AI 소식이 NEXA 운영에 주는 의미",
    updatedAt: "2026-06-17",
    ...overrides,
  };
}

describe("public content news editorial quality", () => {
  it("현재 발행된 news 글은 editorial warning이 없다", () => {
    const newsArticles = PUBLIC_CONTENT_ARTICLES.filter(
      (article) => article.channel === PUBLIC_CONTENT_CHANNELS.news
    );

    expect(newsArticles.length).toBeGreaterThan(0);
    newsArticles.forEach((article) => {
      expect(getPublicContentNewsEditorialWarnings(article)).toEqual([]);
    });
  });

  it("업계 뉴스 해설은 공개 외부 출처 링크를 가진다", () => {
    const article = buildIndustryNewsArticle();

    expect(hasPublicContentExternalReferenceLink(article)).toBe(true);
    expect(getPublicContentNewsEditorialWarnings(article)).toEqual([]);
  });

  it("업계 뉴스 해설에서 출처 링크, 짧은 요약, 원문 복사, 보도자료 표현을 검사한다", () => {
    const article = buildIndustryNewsArticle({
      body: [
        {
          type: "paragraph",
          text: "외부 원문을 그대로 붙여 넣은 것처럼 보이는 긴 문단입니다.".repeat(
            30
          ),
        },
      ],
      summary: "긴 요약입니다.".repeat(40),
      title: "세계 최초 AI 소식 전격 공개",
    });

    expect(getPublicContentNewsEditorialWarnings(article)).toEqual([
      "업계 뉴스 해설 summary는 외부 소식을 짧게 요약해야 합니다.",
      "업계 뉴스 해설은 공개 본문에 외부 출처 링크가 필요합니다.",
      "업계 뉴스 해설은 원문 복사로 보일 수 있는 긴 paragraph를 피해야 합니다.",
      "업계 뉴스 해설은 보도자료처럼 보이는 표현을 피해야 합니다: 전격 공개",
    ]);
  });

  it("news 글 전체에서 과장된 마케팅 표현을 검사한다", () => {
    const article = buildIndustryNewsArticle({
      category: "updates",
      summary: "압도적 업데이트입니다.",
    });

    expect(getPublicContentNewsEditorialWarnings(article)).toEqual([
      "news 글은 과장된 마케팅 표현을 피해야 합니다: 압도적",
    ]);
  });
});
