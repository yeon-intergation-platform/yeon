package world.yeon.backend.common.error;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * ApiException(도메인 비즈니스 예외)을 일관된 {@link ApiErrorResponse}로 변환하는 전역 핸들러.
 *
 * 컨트롤러 로컬 @ExceptionHandler가 있으면 그쪽이 우선하므로, 아직 전환되지 않은(동결 포함)
 * 도메인은 기존 동작이 보존된다. ApiException을 상속한 예외만 여기서 처리된다.
 */
@RestControllerAdvice
public class GlobalApiExceptionHandler {

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<ApiErrorResponse> handleApiException(ApiException error) {
		return ResponseEntity.status(error.status())
			.body(new ApiErrorResponse(error.code(), error.getMessage()));
	}
}
