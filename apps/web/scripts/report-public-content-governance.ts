import {
  buildPublicContentGovernanceReport,
  formatPublicContentGovernanceReportAsMarkdown,
} from "../src/features/public-content/public-content-governance-report";

const report = buildPublicContentGovernanceReport();

console.log(formatPublicContentGovernanceReportAsMarkdown(report));
