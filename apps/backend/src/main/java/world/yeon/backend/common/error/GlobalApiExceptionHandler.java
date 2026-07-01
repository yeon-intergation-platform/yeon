package world.yeon.backend.common.error;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * ApiException(도메인 비즈니스 예외)을 일관된 {@link ApiErrorResponse}로 변환하는 전역 핸들러.
 *
 * 컨트롤러 로컬 @ExceptionHandler가 있으면 그쪽이 우선하므로, 아직 전환되지 않은(동결 포함)
 * 도메인은 기존 동작이 보존된다. ApiException을 상속한 예외만 여기서 처리된다.
 */
@RestControllerAdvice
public class GlobalApiExceptionHandler {
	private static final String CODE_REQUEST_PARAMETER_REQUIRED = "REQUEST_PARAMETER_REQUIRED";
	private static final String CODE_REQUEST_HEADER_REQUIRED = "REQUEST_HEADER_REQUIRED";
	private static final String CODE_REQUEST_VALUE_TYPE_INVALID = "REQUEST_VALUE_TYPE_INVALID";
	private static final String CODE_REQUEST_BODY_INVALID = "REQUEST_BODY_INVALID";
	private static final String CODE_REQUEST_VALIDATION_FAILED = "REQUEST_VALIDATION_FAILED";
	private static final String CODE_AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED";
	private static final String CODE_ACCESS_FORBIDDEN = "ACCESS_FORBIDDEN";
	private static final String CODE_RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND";
	private static final String CODE_REQUEST_INVALID = "REQUEST_INVALID";
	private static final String CODE_HTTP_STATUS_ERROR = "HTTP_STATUS_ERROR";

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<ApiErrorResponse> handleApiException(ApiException error) {
		return error(error.status(), error.code(), error.getMessage());
	}

	@ExceptionHandler(MissingServletRequestParameterException.class)
	public ResponseEntity<ApiErrorResponse> handleMissingRequestParameter() {
		return error(
			HttpStatus.BAD_REQUEST.value(),
			CODE_REQUEST_PARAMETER_REQUIRED,
			"필수 요청 파라미터가 누락되었습니다."
		);
	}

	@ExceptionHandler(MissingRequestHeaderException.class)
	public ResponseEntity<ApiErrorResponse> handleMissingRequestHeader() {
		return error(
			HttpStatus.BAD_REQUEST.value(),
			CODE_REQUEST_HEADER_REQUIRED,
			"필수 요청 헤더가 누락되었습니다."
		);
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ApiErrorResponse> handleMethodArgumentTypeMismatch() {
		return error(
			HttpStatus.BAD_REQUEST.value(),
			CODE_REQUEST_VALUE_TYPE_INVALID,
			"요청 값의 형식이 올바르지 않습니다."
		);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiErrorResponse> handleHttpMessageNotReadable() {
		return error(
			HttpStatus.BAD_REQUEST.value(),
			CODE_REQUEST_BODY_INVALID,
			"요청 본문 형식이 올바르지 않습니다."
		);
	}

	@ExceptionHandler({
		MethodArgumentNotValidException.class,
		HandlerMethodValidationException.class,
		ConstraintViolationException.class
	})
	public ResponseEntity<ApiErrorResponse> handleValidationFailure() {
		return error(
			HttpStatus.BAD_REQUEST.value(),
			CODE_REQUEST_VALIDATION_FAILED,
			"요청 데이터가 올바르지 않습니다."
		);
	}

	@ExceptionHandler({
		NoHandlerFoundException.class,
		NoResourceFoundException.class
	})
	public ResponseEntity<ApiErrorResponse> handleNotFound() {
		return error(
			HttpStatus.NOT_FOUND.value(),
			CODE_RESOURCE_NOT_FOUND,
			"요청한 리소스를 찾을 수 없습니다."
		);
	}

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ApiErrorResponse> handleResponseStatusException(ResponseStatusException error) {
		int status = error.getStatusCode().value();
		return error(
			status,
			codeForStatus(status),
			messageOrDefault(error.getReason(), defaultMessageForStatus(status))
		);
	}

	private static ResponseEntity<ApiErrorResponse> error(int status, String code, String message) {
		return ResponseEntity.status(status).body(new ApiErrorResponse(code, message));
	}

	private static String codeForStatus(int status) {
		return switch (status) {
			case 400 -> CODE_REQUEST_INVALID;
			case 401 -> CODE_AUTHENTICATION_REQUIRED;
			case 403 -> CODE_ACCESS_FORBIDDEN;
			case 404 -> CODE_RESOURCE_NOT_FOUND;
			default -> CODE_HTTP_STATUS_ERROR;
		};
	}

	private static String defaultMessageForStatus(int status) {
		return switch (status) {
			case 400 -> "요청이 올바르지 않습니다.";
			case 401 -> "인증이 필요합니다.";
			case 403 -> "요청 권한이 없습니다.";
			case 404 -> "요청한 리소스를 찾을 수 없습니다.";
			default -> "요청 처리에 실패했습니다.";
		};
	}

	private static String messageOrDefault(String message, String defaultMessage) {
		if (message == null || message.isBlank()) {
			return defaultMessage;
		}
		return message;
	}
}
