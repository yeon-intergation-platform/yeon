export const studentManagementQueryKeys = {
  spaces: () => ["student-management", "spaces"] as const,
  membersRoot: () => ["student-management", "members"] as const,
  members: (spaceId: string | null) =>
    [...studentManagementQueryKeys.membersRoot(), spaceId] as const,
  member: (memberId: string) =>
    ["student-management", "member", memberId] as const,
  studentBoardRoot: (spaceId: string | null) =>
    ["student-management", "student-board", spaceId] as const,
  studentBoard: (spaceId: string | null, historyPeriod: string) =>
    [
      ...studentManagementQueryKeys.studentBoardRoot(spaceId),
      historyPeriod,
    ] as const,
  memberStudentBoardRoot: (spaceId: string | null) =>
    ["student-management", "member-student-board", spaceId] as const,
  memberStudentBoard: (
    spaceId: string | null,
    memberId: string | null,
    period: string
  ) =>
    [
      ...studentManagementQueryKeys.memberStudentBoardRoot(spaceId),
      memberId,
      period,
    ] as const,
  publicCheckLocationSearch: (spaceId: string | null, query: string) =>
    [
      "student-management",
      "public-check-location-search",
      spaceId,
      query,
    ] as const,
  customTabFieldsRoot: (spaceId: string) =>
    ["student-management", "custom-tab-fields", spaceId] as const,
  customTabFields: (spaceId: string, memberId: string, tabId: string) =>
    [
      ...studentManagementQueryKeys.customTabFieldsRoot(spaceId),
      memberId,
      tabId,
    ] as const,
  memberMemos: (spaceId: string | null, memberId: string | null) =>
    ["student-management", "member-memos", spaceId, memberId] as const,
  memberCounselingRecords: (spaceId: string | null, memberId: string | null) =>
    [
      "student-management",
      "member-counseling-records",
      spaceId,
      memberId,
    ] as const,
  memberTabs: (spaceId: string | null) =>
    ["student-management", "member-tabs", spaceId] as const,
  memberReportRecordDetails: (memberId: string, recordIds: readonly string[]) =>
    [
      "student-management",
      "member-report-record-details",
      memberId,
      recordIds.join(","),
    ] as const,
  localImportDrafts: () =>
    ["student-management", "local-import-drafts"] as const,
};
