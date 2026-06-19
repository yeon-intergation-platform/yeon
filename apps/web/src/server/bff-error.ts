import {
  errorResponseSchema,
  type ErrorResponseMeta,
} from "@yeon/api-contract/error";
import { NextResponse } from "next/server";

/**
 * BFF 공통 에러 응답 헬퍼(전 도메인 SSOT).
 *
 * `code`/`message`는 기본, `detail`(code + 상황별 확장 메타데이터)은 선택.
 * 백엔드 Spring code를 클라이언트까지 보존하는 통로다.
 */
export function jsonError(
  message: string,
  status: number,
  detail?: ErrorResponseMeta
) {
  return NextResponse.json(errorResponseSchema.parse({ message, ...detail }), {
    status,
  });
}
