package world.yeon.backend.root_auth.social;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import world.yeon.backend.root_auth.service.AuthSessionServiceException;

@Component
public class SocialIdentityProviderClient {
	private static final Logger log = LoggerFactory.getLogger(SocialIdentityProviderClient.class);
	private static final long OAUTH_PROVIDER_REQUEST_TIMEOUT_SECONDS = 10;
	private final Environment environment;
	private final ObjectMapper objectMapper;
	private final HttpClient httpClient;

	public SocialIdentityProviderClient(Environment environment, ObjectMapper objectMapper) {
		this.environment = environment;
		this.objectMapper = objectMapper;
		this.httpClient = HttpClient.newBuilder().connectTimeout(java.time.Duration.ofSeconds(OAUTH_PROVIDER_REQUEST_TIMEOUT_SECONDS)).build();
	}

	public SocialIdentityProfile fetchProfile(String provider, String code, String codeVerifier, String appOrigin) {
		return switch (provider) {
			case "google" -> fetchGoogleProfile(code, codeVerifier, appOrigin);
			case "kakao" -> fetchKakaoProfile(code, codeVerifier, appOrigin);
			default -> throw new AuthSessionServiceException(400, "provider_not_configured", "지원하지 않는 로그인 공급자입니다.");
		};
	}

	private SocialIdentityProfile fetchGoogleProfile(String code, String codeVerifier, String appOrigin) {
		JsonNode token = postForm(
			"https://oauth2.googleapis.com/token",
			form(
				"code", code,
				"client_id", requiredEnv("GOOGLE_CLIENT_ID", "google"),
				"client_secret", requiredEnv("GOOGLE_CLIENT_SECRET", "google"),
				"redirect_uri", callbackUrl("google", appOrigin),
				"grant_type", "authorization_code",
				"code_verifier", codeVerifier
			),
			"oauth_exchange_failed",
			"구글 토큰 교환"
		);
		JsonNode userInfo = getJson(
			"https://openidconnect.googleapis.com/v1/userinfo",
			token.path("access_token").asText(null),
			"profile_fetch_failed",
			"구글 사용자 정보 조회"
		);

		return new SocialIdentityProfile(
			"google",
			requiredProviderUserId(userInfo, "sub", "profile_fetch_failed", "구글 사용자 정보 조회"),
			normalizeString(userInfo.path("email").asText(null), 320),
			userInfo.path("email_verified").asBoolean(false),
			normalizeString(userInfo.path("name").asText(null), 80),
			normalizeUrl(userInfo.path("picture").asText(null))
		);
	}

	private SocialIdentityProfile fetchKakaoProfile(String code, String codeVerifier, String appOrigin) {
		String body = form(
			"grant_type", "authorization_code",
			"client_id", requiredEnv("KAKAO_REST_API_KEY", "kakao"),
			"redirect_uri", callbackUrl("kakao", appOrigin),
			"code", code,
			"code_verifier", codeVerifier
		);
		String clientSecret = optionalEnv("KAKAO_CLIENT_SECRET");
		if (clientSecret != null) {
			body = body + "&client_secret=" + encode(clientSecret);
		}
		JsonNode token = postForm("https://kauth.kakao.com/oauth/token", body, "oauth_exchange_failed", "카카오 토큰 교환");
		JsonNode userInfo = getJson(
			"https://kapi.kakao.com/v2/user/me?secure_resource=true",
			token.path("access_token").asText(null),
			"profile_fetch_failed",
			"카카오 사용자 정보 조회"
		);
		JsonNode account = userInfo.path("kakao_account");
		JsonNode profile = account.path("profile");

		return new SocialIdentityProfile(
			"kakao",
			requiredProviderUserId(userInfo, "id", "profile_fetch_failed", "카카오 사용자 정보 조회"),
			normalizeString(account.path("email").asText(null), 320),
			account.path("is_email_verified").asBoolean(false),
			normalizeString(profile.path("nickname").asText(null), 80),
			normalizeUrl(profile.path("profile_image_url").asText(null))
		);
	}

	private JsonNode postForm(String url, String body, String errorCode, String label) {
		HttpRequest request = HttpRequest.newBuilder(URI.create(url))
			.header("content-type", "application/x-www-form-urlencoded;charset=utf-8")
			.timeout(java.time.Duration.ofSeconds(OAUTH_PROVIDER_REQUEST_TIMEOUT_SECONDS))
			.POST(HttpRequest.BodyPublishers.ofString(body))
			.build();
		return sendJson(request, errorCode, label);
	}

	private JsonNode getJson(String url, String accessToken, String errorCode, String label) {
		if (accessToken == null || accessToken.isBlank()) {
			throw new AuthSessionServiceException(502, errorCode, label + " 응답이 올바르지 않습니다.");
		}
		HttpRequest request = HttpRequest.newBuilder(URI.create(url))
			.header("authorization", "Bearer " + accessToken)
			.timeout(java.time.Duration.ofSeconds(OAUTH_PROVIDER_REQUEST_TIMEOUT_SECONDS))
			.GET()
			.build();
		return sendJson(request, errorCode, label);
	}

	private JsonNode sendJson(HttpRequest request, String errorCode, String label) {
		try {
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			JsonNode body = response.body() == null || response.body().isBlank() ? objectMapper.nullNode() : objectMapper.readTree(response.body());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				log.warn("소셜 로그인 provider 요청 실패: label={} status={}", label, response.statusCode());
				throw new AuthSessionServiceException(502, errorCode, label + " 요청이 실패했습니다.");
			}
			return body;
		} catch (AuthSessionServiceException error) {
			throw error;
		} catch (Exception error) {
			log.error("소셜 로그인 provider 요청 오류: label={}", label, error);
			throw new AuthSessionServiceException(502, errorCode, label + " 요청이 실패했습니다.");
		}
	}

	private String requiredText(JsonNode node, String field, String errorCode, String label) {
		String value = node.path(field).asText(null);
		if (value == null || value.isBlank()) {
			throw new AuthSessionServiceException(502, errorCode, label + " 응답 형식이 올바르지 않습니다.");
		}
		return value;
	}

	// provider_user_id 컬럼(varchar(191)) 초과를 막기 위해 정규화/길이 제한 후 반환한다.
	private String requiredProviderUserId(JsonNode node, String field, String errorCode, String label) {
		String value = normalizeString(requiredText(node, field, errorCode, label), 191);
		if (value == null) {
			throw new AuthSessionServiceException(502, errorCode, label + " 응답 형식이 올바르지 않습니다.");
		}
		return value;
	}

	private String requiredEnv(String name, String provider) {
		String value = optionalEnv(name);
		if (value == null) {
			throw new AuthSessionServiceException(500, "provider_not_configured", provider + " 로그인 환경변수 " + name + "이 필요합니다.");
		}
		return value;
	}

	private String optionalEnv(String name) {
		String value = environment.getProperty(name);
		if (value != null && !value.trim().isBlank()) return value.trim();
		String normalized = environment.getProperty(name.toLowerCase().replace('_', '.'));
		if (normalized != null && !normalized.trim().isBlank()) return normalized.trim();
		String env = System.getenv(name);
		return env == null || env.trim().isBlank() ? null : env.trim();
	}

	private String callbackUrl(String provider, String appOrigin) {
		String origin = appOrigin == null || appOrigin.isBlank() ? "https://yeon.world" : appOrigin.replaceAll("/+$", "");
		return origin + "/api/auth/" + provider + "/callback";
	}

	private String normalizeString(String value, int maxLength) {
		if (value == null) return null;
		String trimmed = value.trim();
		if (trimmed.isBlank()) return null;
		if (trimmed.length() <= maxLength) return trimmed;
		// surrogate pair 중간에서 잘리지 않도록 경계를 한 칸 앞으로 보정한다.
		int end = maxLength;
		if (Character.isHighSurrogate(trimmed.charAt(end - 1))) {
			end -= 1;
		}
		return trimmed.substring(0, end);
	}

	private String normalizeUrl(String value) {
		String normalized = normalizeString(value, 2048);
		if (normalized == null) return null;
		try {
			return URI.create(normalized).toString();
		} catch (IllegalArgumentException error) {
			return null;
		}
	}

	private String form(String... pairs) {
		StringBuilder builder = new StringBuilder();
		for (int index = 0; index < pairs.length; index += 2) {
			if (index > 0) builder.append('&');
			builder.append(encode(pairs[index])).append('=').append(encode(pairs[index + 1]));
		}
		return builder.toString();
	}

	private String encode(String value) {
		return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
	}
}
