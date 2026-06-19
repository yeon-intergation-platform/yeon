package world.yeon.backend.common.error;

/**
 * API 도메인 비즈니스 예외 공통 베이스.
 *
 * 모든 도메인 예외가 (status, code, message)를 동일하게 노출하므로, 컨트롤러마다
 * @ExceptionHandler + record ErrorResponse를 중복하지 않고 GlobalApiExceptionHandler가
 * 일관 처리한다. 응답 형태는 {@link ApiErrorResponse}({@code code}, {@code message}).
 */
public abstract class ApiException extends RuntimeException {
	private final int status;
	private final String code;

	protected ApiException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() {
		return status;
	}

	public String code() {
		return code;
	}
}
