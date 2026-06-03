import { useMemo, useState } from "react";
import { exportMemberReportDocx } from "@/features/counseling-record-workspace/lib/export-docx";
import type { RecordItem } from "@/features/counseling-record-workspace/lib/types";
import type { MemberWithStatus } from "./use-space-members";

type UseMemberPanelModelParams = {
  member: MemberWithStatus;
  records: RecordItem[];
};

export function useMemberPanelModel({
  member,
  records,
}: UseMemberPanelModelParams) {
  const [exporting, setExporting] = useState(false);

  const memberRecords = useMemo(
    () =>
      records
        .filter((record) => record.memberId === member.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [member.id, records]
  );

  const latestRecord = memberRecords[0] || null;
  const hasProcessingRecord = memberRecords.some(
    (record) => record.status === "processing"
  );
  const statusText = hasProcessingRecord
    ? "상담 분석 진행중"
    : member.indicator === "recent"
      ? "관리 중"
      : member.indicator === "warning"
        ? "주의 필요"
        : "상담 필요";

  const indicatorColor =
    member.indicator === "recent"
      ? "bg-green"
      : member.indicator === "warning"
        ? "bg-text-secondary"
        : "bg-surface-4 border border-border";

  const indicatorTextColor =
    member.indicator === "recent"
      ? "text-green"
      : member.indicator === "warning"
        ? "text-text-secondary"
        : "text-text-dim";

  async function handleExport() {
    setExporting(true);
    try {
      await exportMemberReportDocx(member, records);
    } finally {
      setExporting(false);
    }
  }

  return {
    exporting,
    memberRecords,
    latestRecord,
    hasProcessingRecord,
    statusText,
    indicatorColor,
    indicatorTextColor,
    handleExport,
  };
}
