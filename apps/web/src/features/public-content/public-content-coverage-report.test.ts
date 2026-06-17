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

    expect(report.summary.articleCount).toBe(33);
    expect(report.summary.targetBucketCount).toBe(12);
    expect(report.summary.coveredBucketCount).toBe(9);
    expect(report.summary.missingBucketCount).toBe(3);
    expect(report.channels.map((channel) => channel.channel)).toEqual([
      PUBLIC_CONTENT_CHANNELS.support,
      PUBLIC_CONTENT_CHANNELS.news,
      PUBLIC_CONTENT_CHANNELS.blog,
    ]);
  });

  it("정책상 아직 비어 있는 news/blog bucket을 드러낸다", () => {
    const report = buildPublicContentCoverageReport();
    const missingBucketIds = report.buckets
      .filter((bucket) => bucket.status === "missing")
      .map((bucket) => bucket.id);

    expect(missingBucketIds).toEqual([
      "news:news",
      "blog:devlog",
      "blog:essay",
    ]);
  });

  it("Markdown 출력에 채널 요약과 missing bucket을 담는다", () => {
    const report = buildPublicContentCoverageReport({
      generatedAt: "2026-06-17T00:00:00.000Z",
    });
    const markdown = formatPublicContentCoverageReportAsMarkdown(report);

    expect(markdown).toContain("# 공개 콘텐츠 Coverage 리포트");
    expect(markdown).toContain("Support: 18개");
    expect(markdown).toContain("[비어 있음] news 업계 뉴스 해설 (0/1)");
    expect(markdown).toContain("[비어 있음] blog 개발 일지 (0/1)");
  });

  it("새 devlog 글이 들어오면 blog devlog bucket이 채워진다", () => {
    const report = buildPublicContentCoverageReport({
      articles: [
        ...PUBLIC_CONTENT_ARTICLES,
        {
          body: [{ text: "개발 일지 본문입니다.", type: "paragraph" }],
          category: "devlog",
          channel: PUBLIC_CONTENT_CHANNELS.blog,
          description: "개발 일지 테스트 설명입니다.",
          publishedAt: "2026-06-17",
          readingMinutes: 1,
          service: "nexa",
          slugSegments: ["devlog", "coverage-test"],
          sourcePaths: ["apps/web/src/features/public-content"],
          summary: "개발 일지 테스트 요약입니다.",
          title: "개발 일지 테스트",
          updatedAt: "2026-06-17",
        },
      ],
    });

    expect(
      report.buckets.find((bucket) => bucket.id === "blog:devlog")?.status
    ).toBe("covered");
  });
});
