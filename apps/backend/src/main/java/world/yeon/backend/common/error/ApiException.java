package world.yeon.backend.common.error;

import java.util.Map;

/**
 * API 도메인 비즈니스 예외 공통 베이스.
 *
 * 모든 도메인 예외가 (status, code, message)를 동일하게 노출하므로, 컨트롤러마다
 * @ExceptionHandler + 로컬 오류 DTO를 중복하지 않고 GlobalApiExceptionHandler가
 * 일관 처리한다. 상태 전이 실패처럼 클라이언트 분기에 필요한 메타데이터도 선택적으로 보존한다.
 */
public abstract class ApiException extends RuntimeException {
	private final int status;
	private final String code;
	private final Map<String, Object> details;
	private final String currentState;
	private final String requiredState;
	private final String failedCondition;
	private final String blockedAction;
	private final Map<String, Object> actionGuide;

	protected ApiException(int status, String code, String message) {
		this(status, code, message, null, null, null, null, null, null, null);
	}

	protected ApiException(int status, String code, String message, Throwable cause) {
		this(status, code, message, cause, null, null, null, null, null, null);
	}

	protected ApiException(
		int status,
		String code,
		String message,
		Map<String, Object> details,
		String currentState,
		String requiredState,
		String failedCondition,
		String blockedAction,
		Map<String, Object> actionGuide
	) {
		this(
			status,
			code,
			message,
			null,
			details,
			currentState,
			requiredState,
			failedCondition,
			blockedAction,
			actionGuide
		);
	}

	protected ApiException(
		int status,
		String code,
		String message,
		Throwable cause,
		Map<String, Object> details,
		String currentState,
		String requiredState,
		String failedCondition,
		String blockedAction,
		Map<String, Object> actionGuide
	) {
		super(message, cause);
		this.status = status;
		this.code = code;
		this.details = ApiErrorMetadata.copyOrNull(details);
		this.currentState = currentState;
		this.requiredState = requiredState;
		this.failedCondition = failedCondition;
		this.blockedAction = blockedAction;
		this.actionGuide = ApiErrorMetadata.copyOrNull(actionGuide);
	}

	public int status() {
		return status;
	}

	public String code() {
		return code;
	}

	public Map<String, Object> details() {
		return details;
	}

	public String currentState() {
		return currentState;
	}

	public String requiredState() {
		return requiredState;
	}

	public String failedCondition() {
		return failedCondition;
	}

	public String blockedAction() {
		return blockedAction;
	}

	public Map<String, Object> actionGuide() {
		return actionGuide;
	}
}
