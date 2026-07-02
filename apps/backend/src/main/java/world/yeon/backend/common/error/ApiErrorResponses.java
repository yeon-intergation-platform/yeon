package world.yeon.backend.common.error;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import world.yeon.backend.common.request.RequestIdFilter;

public final class ApiErrorResponses {
	private ApiErrorResponses() {}

	public static ApiErrorResponse of(HttpServletRequest request, String code, String message) {
		return of(request, code, message, null);
	}

	public static ApiErrorResponse ofCurrentRequest(String code, String message) {
		return ofCurrentRequest(code, message, null);
	}

	public static ApiErrorResponse ofCurrentRequest(String code, String message, Map<String, Object> details) {
		HttpServletRequest request = currentRequest();
		if (request == null) {
			return new ApiErrorResponse(code, message, null, details, null, null, null, null, null);
		}
		return of(request, code, message, details);
	}

	public static ApiErrorResponse of(
		HttpServletRequest request,
		String code,
		String message,
		Map<String, Object> details
	) {
		return new ApiErrorResponse(
			code,
			message,
			RequestIdFilter.currentOrCreate(request),
			details,
			null,
			null,
			null,
			null,
			null
		);
	}

	public static ApiErrorResponse from(HttpServletRequest request, ApiException error) {
		return new ApiErrorResponse(
			error.code(),
			error.getMessage(),
			RequestIdFilter.currentOrCreate(request),
			error.details(),
			error.currentState(),
			error.requiredState(),
			error.failedCondition(),
			error.blockedAction(),
			error.actionGuide()
		);
	}

	private static HttpServletRequest currentRequest() {
		if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
			return attributes.getRequest();
		}
		return null;
	}
}
