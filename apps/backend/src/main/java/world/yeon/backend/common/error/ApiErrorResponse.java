package world.yeon.backend.common.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

/**
 * API 공통 에러 응답 본문. 프론트 계약(@yeon/api-contract errorResponseSchema)의
 * code/message/requestId/선택 메타데이터와 1:1로 대응한다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiErrorResponse(
	String code,
	String message,
	String requestId,
	Map<String, Object> details,
	String currentState,
	String requiredState,
	String failedCondition,
	String blockedAction,
	Map<String, Object> actionGuide
) {
	public ApiErrorResponse {
		details = ApiErrorMetadata.copyOrNull(details);
		actionGuide = ApiErrorMetadata.copyOrNull(actionGuide);
	}

	public ApiErrorResponse(String code, String message) {
		this(code, message, null, null, null, null, null, null, null);
	}
}
