import {
  errorResponseSchema,
  type ErrorResponseMeta,
} from "@yeon/api-contract/error";
import { NextResponse } from "next/server";

/**
 * BFF 공통 에러 응답 헬퍼(전 도메인 SSOT).
 *
 * `code`/`message`는 기본, `detail`(Spring code + 상황별 확장 메타데이터)은 선택.
 * 백엔드 Spring code를 클라이언트까지 보존하는 통로다.
 */
export function defaultErrorCodeForStatus(status: number) {
  if (status === 400) return "INVALID_REQUEST";
  if (status === 401) return "UNAUTHENTICATED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 422) return "INVALID_REQUEST";
  if (status === 429) return "RATE_LIMITED";
  if (status === 502) return "UPSTREAM_ERROR";
  if (status === 503) return "SERVICE_UNAVAILABLE";
  return status >= 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED";
}

export function createErrorResponseBody(
  message: string,
  status: number,
  detail?: ErrorResponseMeta
) {
  const code =
    typeof detail?.code === "string" && detail.code.trim()
      ? detail.code
      : defaultErrorCodeForStatus(status);

  return errorResponseSchema.parse({ ...detail, code, message });
}

export function jsonError(
  message: string,
  status: number,
  detail?: ErrorResponseMeta
) {
  return NextResponse.json(createErrorResponseBody(message, status, detail), {
    status,
  });
}
