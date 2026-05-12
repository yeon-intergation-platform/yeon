export const counselingWorkspaceQueryKeys = {
  spaces: () => ["counseling-workspace", "spaces"] as const,
  spaceMembers: (spaceId: string | null) =>
    ["counseling-workspace", "space-members", spaceId] as const,
  records: () => ["counseling-workspace", "records"] as const,
  record: (recordId: string) =>
    ["counseling-workspace", "record", recordId] as const,
  spaceTemplates: () => ["counseling-workspace", "space-templates"] as const,
};
