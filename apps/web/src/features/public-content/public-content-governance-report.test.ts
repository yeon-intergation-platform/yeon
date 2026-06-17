import { describe, expect, it } from "vitest";
import {
  buildPublicContentGovernanceReport,
  formatPublicContentGovernanceReportAsMarkdown,
} from "./public-content-governance-report";

function findItem(
  report: ReturnType<typeof buildPublicContentGovernanceReport>,
  itemId: string
) {
  return report.sections
    .flatMap((section) => section.items)
    .find((item) => item.id === itemId);
}

describe("public content governance report", () => {
  it("현재 registry 기준 출시 후 운영 점검 리포트를 만든다", () => {
    const report = buildPublicContentGovernanceReport({
      generatedAt: "2026-06-17T00:00:00.000Z",
    });

    expect(report.sections.map((section) => section.id)).toEqual([
      "launch-week",
      "monthly",
      "on-change",
    ]);
    expect(report.summary.articleCount).toBe(33);
    expect(report.summary.channelCount).toBe(3);
    expect(report.summary.warningCount).toBe(0);
    expect(findItem(report, "search-console-index-state")?.status).toBe(
      "manual"
    );
    expect(findItem(report, "seo-warning-queue")?.status).toBe("ready");
    expect(findItem(report, "source-traceability")?.status).toBe("ready");
    expect(findItem(report, "information-architecture-fit")?.status).toBe(
      "ready"
    );
  });

  it("Markdown 출력에 수동 확인과 자동 evidence를 함께 담는다", () => {
    const report = buildPublicContentGovernanceReport({
      generatedAt: "2026-06-17T00:00:00.000Z",
    });
    const markdown = formatPublicContentGovernanceReportAsMarkdown(report);

    expect(markdown).toContain("# 공개 콘텐츠 운영 거버넌스 리포트");
    expect(markdown).toContain("## 출시 첫 주 확인");
    expect(markdown).toContain("[수동 확인] Search Console 색인 상태 확인");
    expect(markdown).toContain("[정상] SEO warning queue 처리");
  });
});
