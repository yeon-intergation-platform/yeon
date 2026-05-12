"use client";

import { useQuery } from "@tanstack/react-query";
import type { CounselingRecordListItem } from "@yeon/api-contract/counseling-records";
import { studentManagementFetchJson } from "./student-management-fetch";
import { studentManagementQueryKeys } from "./student-management-query-keys";
import { resolveApiHrefForCurrentPath } from "@/lib/app-route-paths";

export function useMemberCounselingRecords(
  spaceId: string | null,
  memberId: string | null
) {
  return useQuery({
    queryKey: studentManagementQueryKeys.memberCounselingRecords(
      spaceId,
      memberId
    ),
    enabled: !!spaceId && !!memberId,
    queryFn: () =>
      studentManagementFetchJson<{ records: CounselingRecordListItem[] }>(
        resolveApiHrefForCurrentPath(
          `/api/v1/spaces/${spaceId}/members/${memberId}/counseling-records`
        ),
        { method: "GET" },
        "상담 기록을 불러오지 못했습니다."
      ),
  });
}
