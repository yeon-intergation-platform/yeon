package world.yeon.backend.common.error;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import world.yeon.backend.common.request.RequestIdFilter;

public final class ApiErrorResponses {
	private ApiErrorResponses() {}

	public static ApiErrorResponse of(HttpServletRequest request, String code, String message) {
		return of(request, code, message, null);
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
}
