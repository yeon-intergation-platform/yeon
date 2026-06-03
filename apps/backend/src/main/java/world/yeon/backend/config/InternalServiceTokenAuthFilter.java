package world.yeon.backend.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class InternalServiceTokenAuthFilter extends OncePerRequestFilter {

	private static final String INTERNAL_TOKEN_HEADER = "X-Yeon-Internal-Token";
	private final String expectedToken;

	public InternalServiceTokenAuthFilter(String expectedToken) {
		this.expectedToken = expectedToken == null ? "" : expectedToken.trim();
	}

	@Override
	protected void doFilterInternal(
		HttpServletRequest request,
		HttpServletResponse response,
		FilterChain filterChain
	) throws ServletException, IOException {
		if (isApplicationRouteRequest(request) && isValidToken(request)) {
			SecurityContextHolder.getContext()
				.setAuthentication(
					new UsernamePasswordAuthenticationToken(
						"internal-bff",
						"N/A",
						AuthorityUtils.createAuthorityList("ROLE_INTERNAL")
					)
				);
		}

		filterChain.doFilter(request, response);
	}

	private boolean isApplicationRouteRequest(HttpServletRequest request) {
		String path = request.getRequestURI();
		return path != null && !path.startsWith("/actuator");
	}

	private boolean isValidToken(HttpServletRequest request) {
		if (expectedToken.isBlank()) {
			return false;
		}

		String provided = request.getHeader(INTERNAL_TOKEN_HEADER);
		if (provided == null) {
			return false;
		}
		return MessageDigest.isEqual(
			expectedToken.getBytes(StandardCharsets.UTF_8),
			provided.getBytes(StandardCharsets.UTF_8)
		);
	}
}
