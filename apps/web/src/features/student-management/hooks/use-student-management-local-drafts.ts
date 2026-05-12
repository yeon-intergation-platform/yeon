"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppRoute } from "@/lib/app-route-context";
import { studentManagementFetchJson } from "./student-management-fetch";
import { studentManagementQueryKeys } from "./student-management-query-keys";

export type LocalImportDraftSummary = {
  id: string;
  status:
    | "uploaded"
    | "analyzing"
    | "analyzed"
    | "edited"
    | "imported"
    | "error";
  selectedFile: {
    name: string;
  };
  processingMessage: string | null;
  error: string | null;
  updatedAt: string;
  expiresAt: string;
};

export function useStudentManagementLocalDrafts() {
  const { resolveApiHref } = useAppRoute();

  const query = useQuery({
    queryKey: studentManagementQueryKeys.localImportDrafts(),
    queryFn: () =>
      studentManagementFetchJson<{ drafts: LocalImportDraftSummary[] }>(
        resolveApiHref("/api/v1/integrations/local/drafts?limit=100"),
        { method: "GET" },
        "임시 가져오기 초안을 불러오지 못했습니다."
      ),
  });

  const localDrafts = query.data ? query.data.drafts : [];
  const localDraftsError =
    query.error instanceof Error
      ? query.error.message
      : query.error
        ? "임시 가져오기 초안을 불러오지 못했습니다."
        : null;

  return {
    localDrafts,
    localDraftCount: localDrafts.length,
    localDraftsLoading: query.isPending,
    localDraftsError,
    refetchLocalDrafts: query.refetch,
  };
}
