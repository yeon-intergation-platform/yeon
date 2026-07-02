import { z } from "zod";

/**
 * 공통 에러 응답 계약.
 *
 * 설계 원칙: `code`/`message`가 기본 계약, 나머지는 에러 유형별 선택 메타데이터다.
 * 모든 필드를 강제하지 않는다 — 단순 서버 장애에 상태전이/선행조건 필드를 억지로
 * 채우지 말고, 그 정보가 핵심인 에러에서만 해당 필드를 붙인다.
 *
 * - code: 프론트가 분기하고 로그/문서/테스트의 기준이 되는 고정 식별자.
 *   (호환을 위해 optional로 점진 도입. 백엔드 Spring은 이미 code를 일관 제공한다.)
 * - message: 사용자 또는 클라이언트에게 보여줄 설명.
 * - details: 입력값/제한값/실제값 등 추가 정보가 있을 때만.
 * - currentState/requiredState: 상태 전이 실패일 때만.
 * - failedCondition: 선행 조건이 깨진 게 핵심일 때만.
 * - blockedAction: 어떤 행동이 막혔는지가 도움이 될 때만.
 * - actionGuide: 사용자가 취할 다음 행동이 명확할 때만. 신규 생산자는 객체형을 우선한다.
 */
export const errorActionGuideSchema = z.union([
  z.string(),
  z.record(z.string(), z.unknown()),
]);

export const errorResponseSchema = z.object({
  code: z.string().optional(),
  message: z.string(),
  requestId: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  currentState: z.string().optional(),
  requiredState: z.string().optional(),
  failedCondition: z.string().optional(),
  blockedAction: z.string().optional(),
  actionGuide: errorActionGuideSchema.optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/** 생산 측에서 message 외 메타(code + 확장 필드)를 한 번에 전달하기 위한 보조 타입. */
export type ErrorResponseMeta = Omit<ErrorResponse, "message">;
