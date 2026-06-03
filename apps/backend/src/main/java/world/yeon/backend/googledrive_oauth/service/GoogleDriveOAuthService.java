package world.yeon.backend.googledrive_oauth.service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import world.yeon.backend.googledrive_oauth.dto.GoogleDriveOAuthUrlResponse;
import world.yeon.backend.googledrive_oauth.repository.GoogleDriveOAuthRepository;

@Service
public class GoogleDriveOAuthService {
	private static final String AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
	private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
	private static final String SCOPE = String.join(" ",
		"https://www.googleapis.com/auth/drive.readonly",
		"https://www.googleapis.com/auth/spreadsheets"
	);
	private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(10);
	private static final Logger log = LoggerFactory.getLogger(GoogleDriveOAuthService.class);

	private final GoogleDriveOAuthRepository repository;
	private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

	public GoogleDriveOAuthService(GoogleDriveOAuthRepository repository) {
		this.repository = repository;
	}

	public GoogleDriveOAuthUrlResponse buildOAuthUrl(String state) {
		// CSRF 방어: state는 web BFF 콜백이 세션/쿠키에 바인딩한 값을 콜백에서 반드시 검증해야 한다.
		// 백엔드는 state를 그대로 전달만 하므로 OAuth state 검증 책임은 web BFF 콜백에 있다.
		if (state == null || state.isBlank()) {
			throw new GoogleDriveOAuthServiceException(400, "INVALID_REQUEST", "state가 필요합니다.");
		}
		String url = AUTH_URL + "?client_id=" + enc(getClientId())
			+ "&response_type=code"
			+ "&redirect_uri=" + enc(getRedirectUri())
			+ "&scope=" + enc(SCOPE)
			+ "&state=" + enc(state)
			+ "&access_type=offline&include_granted_scopes=true&prompt=consent";
		return new GoogleDriveOAuthUrlResponse(url);
	}

	public void exchangeAndSave(UUID userId, String code) {
		String existingRefreshToken = repository.findRefreshToken(userId);
		String body = "client_id=" + enc(getClientId())
			+ "&client_secret=" + enc(getClientSecret())
			+ "&code=" + enc(code)
			+ "&redirect_uri=" + enc(getRedirectUri())
			+ "&grant_type=authorization_code";
		HttpRequest request = HttpRequest.newBuilder(URI.create(TOKEN_URL))
			.timeout(REQUEST_TIMEOUT)
			.header("Content-Type", "application/x-www-form-urlencoded")
			.POST(HttpRequest.BodyPublishers.ofString(body))
			.build();
		try {
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				log.warn("Google 토큰 교환 실패: status={} body={}", response.statusCode(), response.body());
				throw new GoogleDriveOAuthServiceException(502, "GOOGLE_OAUTH_EXCHANGE_FAILED", "토큰 교환에 실패했습니다.");
			}
			String accessToken = extract(response.body(), "access_token");
			String refreshToken = extract(response.body(), "refresh_token");
			long expiresIn = extractLong(response.body(), "expires_in");
			if ((refreshToken == null || refreshToken.isBlank()) && (existingRefreshToken == null || existingRefreshToken.isBlank())) {
				throw new GoogleDriveOAuthServiceException(502, "GOOGLE_REFRESH_TOKEN_MISSING", "Google이 refresh_token을 반환하지 않았습니다. 기존 접근 권한을 제거한 뒤 다시 연결해주세요.");
			}
			String nextRefreshToken = (refreshToken == null || refreshToken.isBlank()) ? existingRefreshToken : refreshToken;
			if (accessToken == null || accessToken.isBlank() || nextRefreshToken == null || nextRefreshToken.isBlank() || expiresIn <= 0) {
				throw new GoogleDriveOAuthServiceException(502, "GOOGLE_OAUTH_EXCHANGE_FAILED", "Google 토큰 응답이 올바르지 않습니다.");
			}
			repository.upsertTokens(userId, accessToken, nextRefreshToken, OffsetDateTime.now(ZoneOffset.UTC).plusSeconds(expiresIn), OffsetDateTime.now(ZoneOffset.UTC));
		} catch (GoogleDriveOAuthServiceException error) {
			throw error;
		} catch (HttpTimeoutException error) {
			throw new GoogleDriveOAuthServiceException(502, "GOOGLE_OAUTH_EXCHANGE_TIMEOUT", "토큰 교환에 실패했습니다.");
		} catch (Exception error) {
			throw new GoogleDriveOAuthServiceException(502, "GOOGLE_OAUTH_EXCHANGE_FAILED", "토큰 교환에 실패했습니다.");
		}
	}

	private String getClientId() {
		String value = System.getenv("GOOGLE_CLIENT_ID");
		if (value == null || value.isBlank()) throw new GoogleDriveOAuthServiceException(500, "GOOGLE_CLIENT_ID_MISSING", "GOOGLE_CLIENT_ID가 설정되지 않았습니다.");
		return value;
	}
	private String getClientSecret() {
		String value = System.getenv("GOOGLE_CLIENT_SECRET");
		if (value == null || value.isBlank()) throw new GoogleDriveOAuthServiceException(500, "GOOGLE_CLIENT_SECRET_MISSING", "GOOGLE_CLIENT_SECRET가 설정되지 않았습니다.");
		return value;
	}
	private String getRedirectUri() {
		String base = System.getenv("NEXT_PUBLIC_APP_URL");
		if (base == null || base.isBlank()) base = "http://localhost:3000";
		return base.replaceAll("/$", "") + "/counseling-service/api/v1/integrations/googledrive/auth/callback";
	}
	private String enc(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
	private String extract(String json, String key) {
		var pattern = java.util.regex.Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]*)\"");
		var matcher = pattern.matcher(json);
		return matcher.find() ? matcher.group(1) : null;
	}
	private long extractLong(String json, String key) {
		var pattern = java.util.regex.Pattern.compile("\"" + key + "\"\\s*:\\s*(\\d+)");
		var matcher = pattern.matcher(json);
		return matcher.find() ? Long.parseLong(matcher.group(1)) : 0L;
	}
}
