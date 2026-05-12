import { resolveApiHrefForCurrentPath } from "@/lib/app-route-paths";

import type { Member } from "../types";
import {
  studentManagementFetchJson,
  studentManagementFetchVoid,
} from "./student-management-fetch";

interface ProfileSuggestions {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: "active" | "withdrawn" | "graduated" | null;
  initialRiskLevel?: "low" | "medium" | "high" | null;
  confidence: Record<string, "high" | "medium" | "low">;
  rawContext?: string;
}

export async function importProfileSuggestions(
  spaceId: string,
  memberId: string,
  file: File
): Promise<ProfileSuggestions> {
  const form = new FormData();
  form.append("file", file);

  const payload = await studentManagementFetchJson<{
    suggestions: ProfileSuggestions;
  }>(
    resolveApiHrefForCurrentPath(
      `/api/v1/spaces/${spaceId}/members/${memberId}/profile-import`
    ),
    { method: "POST", body: form },
    "AI 분석에 실패했습니다."
  );

  return payload.suggestions;
}

export async function saveImportedProfileFields(
  spaceId: string,
  memberId: string,
  patch: Record<string, string | null>
): Promise<void> {
  await studentManagementFetchVoid(
    resolveApiHrefForCurrentPath(
      `/api/v1/spaces/${spaceId}/members/${memberId}`
    ),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    },
    "저장에 실패했습니다."
  );
}

export async function loadImportedMember(
  memberId: string
): Promise<{ member: Member }> {
  return studentManagementFetchJson<{ member: Member }>(
    resolveApiHrefForCurrentPath(`/api/v1/members/${memberId}`),
    {},
    "저장된 수강생 정보를 다시 불러오지 못했습니다."
  );
}
