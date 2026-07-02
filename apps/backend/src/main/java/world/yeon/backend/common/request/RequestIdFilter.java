package world.yeon.backend.common.request;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {
	public static final String HEADER_NAME = "X-Request-Id";
	public static final String ATTRIBUTE_NAME = RequestIdFilter.class.getName() + ".requestId";
	private static final String MDC_KEY = "requestId";
	private static final int MAX_REQUEST_ID_LENGTH = 128;

	@Override
	protected void doFilterInternal(
		HttpServletRequest request,
		HttpServletResponse response,
		FilterChain filterChain
	) throws ServletException, IOException {
		String requestId = resolveOrCreate(request);
		request.setAttribute(ATTRIBUTE_NAME, requestId);
		response.setHeader(HEADER_NAME, requestId);
		MDC.put(MDC_KEY, requestId);
		try {
			filterChain.doFilter(request, response);
		} finally {
			MDC.remove(MDC_KEY);
		}
	}

	public static String currentOrCreate(HttpServletRequest request) {
		Object attribute = request.getAttribute(ATTRIBUTE_NAME);
		if (attribute instanceof String requestId && !requestId.isBlank()) {
			return requestId;
		}
		String requestId = resolveOrCreate(request);
		request.setAttribute(ATTRIBUTE_NAME, requestId);
		return requestId;
	}

	private static String resolveOrCreate(HttpServletRequest request) {
		String headerRequestId = sanitize(request.getHeader(HEADER_NAME));
		if (headerRequestId != null) {
			return headerRequestId;
		}
		return newRequestId();
	}

	private static String sanitize(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		if (trimmed.isEmpty() || trimmed.length() > MAX_REQUEST_ID_LENGTH) {
			return null;
		}
		for (int index = 0; index < trimmed.length(); index += 1) {
			char character = trimmed.charAt(index);
			if (!isSafeHeaderCharacter(character)) {
				return null;
			}
		}
		return trimmed;
	}

	private static boolean isSafeHeaderCharacter(char character) {
		return (character >= 'a' && character <= 'z')
			|| (character >= 'A' && character <= 'Z')
			|| (character >= '0' && character <= '9')
			|| character == '-'
			|| character == '_'
			|| character == '.'
			|| character == ':';
	}

	private static String newRequestId() {
		return "req_" + UUID.randomUUID().toString().replace("-", "");
	}
}
