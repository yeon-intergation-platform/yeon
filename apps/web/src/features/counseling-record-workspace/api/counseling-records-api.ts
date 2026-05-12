import type {
  CounselingRecordDetail,
  CounselingRecordListItem,
} from "@yeon/api-contract/counseling-records";
import { resolveApiHrefForCurrentPath } from "@/lib/app-route-paths";
import { buildCounselingClientRequestId } from "@/app/counseling-service/_lib/client-request-id";
import {
  counselingWorkspaceFetchJson,
  counselingWorkspaceFetchVoid,
} from "./counseling-workspace-fetch";

export type CounselingRecordsListResponse = {
  records: CounselingRecordListItem[];
};

export type CounselingRecordDetailResponse = {
  record: CounselingRecordDetail;
};

export function fetchCounselingRecords() {
  return counselingWorkspaceFetchJson<CounselingRecordsListResponse>(
    resolveApiHrefForCurrentPath("/api/v1/counseling-records"),
    {},
    "상담 기록 목록을 조회하지 못했습니다."
  );
}

export function fetchCounselingRecordDetail(recordId: string) {
  return counselingWorkspaceFetchJson<CounselingRecordDetailResponse>(
    resolveApiHrefForCurrentPath(`/api/v1/counseling-records/${recordId}`),
    {},
    "상담 기록 상세를 조회하지 못했습니다."
  );
}

export function clearCounselingRecordChat(recordId: string) {
  return counselingWorkspaceFetchVoid(
    resolveApiHrefForCurrentPath(`/api/v1/counseling-records/${recordId}/chat`),
    { method: "DELETE" },
    "채팅 기록을 초기화하지 못했습니다."
  );
}

export function uploadCounselingRecordAudio(
  formData: FormData,
  fallbackErrorMessage: string
) {
  return counselingWorkspaceFetchJson<CounselingRecordDetailResponse>(
    resolveApiHrefForCurrentPath("/api/v1/counseling-records"),
    {
      method: "POST",
      body: formData,
    },
    fallbackErrorMessage
  );
}

export function retryCounselingRecordTranscription(recordId: string) {
  return counselingWorkspaceFetchJson<CounselingRecordDetailResponse>(
    resolveApiHrefForCurrentPath(
      `/api/v1/counseling-records/${recordId}/transcribe`
    ),
    {
      method: "POST",
      headers: {
        "X-Client-Request-Id": buildCounselingClientRequestId(),
      },
    },
    "과거 실패 기록 재분석을 다시 시작하지 못했습니다."
  );
}

export function retryCounselingRecordAnalysis(recordId: string) {
  return counselingWorkspaceFetchVoid(
    resolveApiHrefForCurrentPath(
      `/api/v1/counseling-records/${recordId}/analyze`
    ),
    {
      method: "POST",
      headers: {
        "X-Client-Request-Id": buildCounselingClientRequestId(),
      },
    },
    "AI 분석을 다시 시작하지 못했습니다."
  );
}
