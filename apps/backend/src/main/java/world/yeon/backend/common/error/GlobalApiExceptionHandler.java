package world.yeon.backend.common.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
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
	public ResponseEntity<ApiErrorResponse> handleApiException(ApiException error, HttpServletRequest request) {
		return ResponseEntity.status(error.status()).body(ApiErrorResponses.from(request, error));
	}

	@ExceptionHandler(MissingServletRequestParameterException.class)
	public ResponseEntity<ApiErrorResponse> handleMissingRequestParameter(
		MissingServletRequestParameterException error,
		HttpServletRequest request
	) {
		return error(
			request,
			HttpStatus.BAD_REQUEST.value(),
			CODE_REQUEST_PARAMETER_REQUIRED,
			"필수 요청 파라미터가 누락되었습니다.",
			details(
				"parameter",
				error.getParameterName(),
				"expectedType",
				error.getParameterType()
			)
		);
	}

	@ExceptionHandler(MissingRequestHeaderException.class)
	public ResponseEntity<ApiErrorResponse> handleMissingRequestHeader(
		MissingRequestHeaderException error,
		HttpServletRequest request
	) {
		return error(
			request,
			HttpStatus.BAD_REQUEST.value(),
			CODE_REQUEST_HEADER_REQUIRED,
			"필수 요청 헤더가 누락되었습니다.",
			details("header", error.getHeaderName())
		);
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ApiErrorResponse> handleMethodArgumentTypeMismatch(
		MethodArgumentTypeMismatchException error,
		HttpServletRequest request
	) {
		return error(
			request,
			HttpStatus.BAD_REQUEST.value(),
			CODE_REQUEST_VALUE_TYPE_INVALID,
			"요청 값의 형식이 올바르지 않습니다.",
			details(
				"name",
				error.getName(),
				"requiredType",
				requiredTypeName(error),
				"value",
				error.getValue()
			)
		);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiErrorResponse> handleHttpMessageNotReadable(HttpServletRequest request) {
		return error(
			request,
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
	public ResponseEntity<ApiErrorResponse> handleValidationFailure(Exception error, HttpServletRequest request) {
		return error(
			request,
			HttpStatus.BAD_REQUEST.value(),
			CODE_REQUEST_VALIDATION_FAILED,
			"요청 데이터가 올바르지 않습니다.",
			validationDetails(error)
		);
	}

	@ExceptionHandler({
		NoHandlerFoundException.class,
		NoResourceFoundException.class
	})
	public ResponseEntity<ApiErrorResponse> handleNotFound(HttpServletRequest request) {
		return error(
			request,
			HttpStatus.NOT_FOUND.value(),
			CODE_RESOURCE_NOT_FOUND,
			"요청한 리소스를 찾을 수 없습니다."
		);
	}

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ApiErrorResponse> handleResponseStatusException(
		ResponseStatusException error,
		HttpServletRequest request
	) {
		int status = error.getStatusCode().value();
		return error(
			request,
			status,
			codeForStatus(status),
			messageOrDefault(error.getReason(), defaultMessageForStatus(status))
		);
	}

	private static ResponseEntity<ApiErrorResponse> error(
		HttpServletRequest request,
		int status,
		String code,
		String message
	) {
		return error(request, status, code, message, null);
	}

	private static ResponseEntity<ApiErrorResponse> error(
		HttpServletRequest request,
		int status,
		String code,
		String message,
		Map<String, Object> details
	) {
		return ResponseEntity.status(status).body(ApiErrorResponses.of(request, code, message, details));
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

	private static Map<String, Object> details(Object... keysAndValues) {
		Map<String, Object> details = new LinkedHashMap<>();
		for (int index = 0; index + 1 < keysAndValues.length; index += 2) {
			if (!(keysAndValues[index] instanceof String key)) {
				continue;
			}
			Object value = keysAndValues[index + 1];
			if (value != null) {
				details.put(key, value);
			}
		}
		if (details.isEmpty()) {
			return null;
		}
		return details;
	}

	private static String requiredTypeName(MethodArgumentTypeMismatchException error) {
		Class<?> requiredType = error.getRequiredType();
		if (requiredType == null) {
			return null;
		}
		return requiredType.getSimpleName();
	}

	private static Map<String, Object> validationDetails(Exception error) {
		if (error instanceof MethodArgumentNotValidException methodArgumentError) {
			Map<String, Object> details = new LinkedHashMap<>();
			for (FieldError fieldError : methodArgumentError.getBindingResult().getFieldErrors()) {
				details.putIfAbsent(
					fieldError.getField(),
					messageOrDefault(fieldError.getDefaultMessage(), "유효하지 않은 값입니다.")
				);
			}
			return ApiErrorMetadata.copyOrNull(details);
		}
		if (error instanceof ConstraintViolationException constraintError) {
			Map<String, Object> details = new LinkedHashMap<>();
			constraintError.getConstraintViolations().forEach(violation ->
				details.putIfAbsent(
					violation.getPropertyPath().toString(),
					messageOrDefault(violation.getMessage(), "유효하지 않은 값입니다.")
				)
			);
			return ApiErrorMetadata.copyOrNull(details);
		}
		return null;
	}
}
