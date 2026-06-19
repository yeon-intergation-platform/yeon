package world.yeon.backend.common.error;

/**
 * API 공통 에러 응답 본문. 프론트 계약(@yeon/api-contract errorResponseSchema)의
 * code/message와 1:1로 대응한다. 컨트롤러별 중복 record ErrorResponse를 대체한다.
 */
public record ApiErrorResponse(String code, String message) {}
