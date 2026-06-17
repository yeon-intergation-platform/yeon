import {
  buildPublicContentCoverageReport,
  formatPublicContentCoverageReportAsMarkdown,
} from "../src/features/public-content/public-content-coverage-report";

const report = buildPublicContentCoverageReport();

console.log(formatPublicContentCoverageReportAsMarkdown(report));
