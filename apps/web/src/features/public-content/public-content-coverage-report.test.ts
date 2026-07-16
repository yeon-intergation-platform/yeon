import { describe, expect, it } from "vitest";
import {
  buildPublicContentCoverageReport,
  formatPublicContentCoverageReportAsMarkdown,
} from "./public-content-coverage-report";
import {
  PUBLIC_CONTENT_ARTICLES,
  PUBLIC_CONTENT_CHANNELS,
} from "./public-content-data";

describe("public content coverage report", () => {
  it("현재 registry 기준 채널별 coverage 요약을 만든다", () => {
    const report = buildPublicContentCoverageReport({
      generatedAt: "2026-06-17T00:00:00.000Z",
    });

    expect(report.summary.articleCount).toBe(PUBLIC_CONTENT_ARTICLES.length);
    expect(report.summary.targetBucketCount).toBe(9);
    expect(report.summary.coveredBucketCount).toBe(9);
    expect(report.summary.missingBucketCount).toBe(0);
    expect(report.channels.map((channel) => channel.channel)).toEqual([
      PUBLIC_CONTENT_CHANNELS.support,
      PUBLIC_CONTENT_CHANNELS.news,
      PUBLIC_CONTENT_CHANNELS.blog,
    ]);
  });

  it("현재 공개 기준으로 필요한 news/blog bucket이 모두 채워져 있다", () => {
    const report = buildPublicContentCoverageReport();
    const missingBucketIds = report.buckets
      .filter((bucket) => bucket.status === "missing")
      .map((bucket) => bucket.id);

    expect(missingBucketIds).toEqual([]);
  });

  it("Markdown 출력에 채널 요약과 missing bucket을 담는다", () => {
    const report = buildPublicContentCoverageReport({
      generatedAt: "2026-06-17T00:00:00.000Z",
    });
    const markdown = formatPublicContentCoverageReportAsMarkdown(report);
    const supportArticleCount = PUBLIC_CONTENT_ARTICLES.filter(
      (article) => article.channel === PUBLIC_CONTENT_CHANNELS.support
    ).length;

    expect(markdown).toContain("# 공개 콘텐츠 Coverage 리포트");
    expect(markdown).toContain(`Support: ${supportArticleCount}개`);
    expect(markdown).toContain("[채움] news 공식 공지 (1/1)");
    expect(markdown).toContain("[채움] blog 기술 글 (1/1)");
  });

  it("새 제품 글이 들어오면 blog 제품 글 bucket 수를 반영한다", () => {
    const report = buildPublicContentCoverageReport({
      articles: [
        ...PUBLIC_CONTENT_ARTICLES,
        {
          body: [{ text: "제품 글 본문입니다.", type: "paragraph" }],
          category: "product",
          channel: PUBLIC_CONTENT_CHANNELS.blog,
          description: "제품 글 테스트 설명입니다.",
          publishedAt: "2026-06-17",
          readingMinutes: 1,
          service: "nexa",
          slugSegments: ["product", "coverage-test"],
          sourcePaths: ["apps/web/src/features/public-content"],
          summary: "제품 글 테스트 요약입니다.",
          title: "제품 글 테스트",
          updatedAt: "2026-06-17",
        },
      ],
    });

    expect(
      report.buckets.find((bucket) => bucket.id === "blog:product")
        ?.articleCount
    ).toBe(4);
  });
});
