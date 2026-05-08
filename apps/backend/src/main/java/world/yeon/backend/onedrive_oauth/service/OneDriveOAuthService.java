package world.yeon.backend.onedrive_oauth.service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import world.yeon.backend.onedrive_oauth.dto.OneDriveOAuthUrlResponse;
import world.yeon.backend.onedrive_oauth.repository.OneDriveOAuthRepository;

@Service
@Profile("jdbc")
public class OneDriveOAuthService {
	private static final String AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
	private static final String TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
	private static final String SCOPE = String.join(" ", "Files.ReadWrite.All", "offline_access", "User.Read");

	private final OneDriveOAuthRepository repository;
	private final HttpClient httpClient = HttpClient.newHttpClient();

	public OneDriveOAuthService(OneDriveOAuthRepository repository) {
		this.repository = repository;
	}

	public OneDriveOAuthUrlResponse buildOAuthUrl(String state) {
		if (state == null || state.isBlank()) throw new OneDriveOAuthServiceException(400, "INVALID_REQUEST", "state가 필요합니다.");
		String url = AUTH_URL + "?client_id=" + enc(getClientId())
			+ "&response_type=code"
			+ "&redirect_uri=" + enc(getRedirectUri())
			+ "&scope=" + enc(SCOPE)
			+ "&state=" + enc(state)
			+ "&response_mode=query&prompt=consent";
		return new OneDriveOAuthUrlResponse(url);
	}

	public void exchangeAndSave(UUID userId, String code) {
		String body = "client_id=" + enc(getClientId())
			+ "&client_secret=" + enc(getClientSecret())
			+ "&code=" + enc(code)
			+ "&redirect_uri=" + enc(getRedirectUri())
			+ "&grant_type=authorization_code";
		HttpRequest request = HttpRequest.newBuilder(URI.create(TOKEN_URL))
			.header("Content-Type", "application/x-www-form-urlencoded")
			.POST(HttpRequest.BodyPublishers.ofString(body))
			.build();
		try {
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new OneDriveOAuthServiceException(502, "ONEDRIVE_OAUTH_EXCHANGE_FAILED", "Microsoft 토큰 교환 실패: " + response.body());
			}
			String accessToken = extract(response.body(), "access_token");
			String refreshToken = extract(response.body(), "refresh_token");
			long expiresIn = extractLong(response.body(), "expires_in");
			if (accessToken == null || accessToken.isBlank() || refreshToken == null || refreshToken.isBlank() || expiresIn <= 0) {
				throw new OneDriveOAuthServiceException(502, "ONEDRIVE_OAUTH_EXCHANGE_FAILED", "Microsoft 토큰 응답이 올바르지 않습니다.");
			}
			repository.upsertTokens(userId, accessToken, refreshToken, OffsetDateTime.now(ZoneOffset.UTC).plusSeconds(expiresIn), OffsetDateTime.now(ZoneOffset.UTC));
		} catch (OneDriveOAuthServiceException error) {
			throw error;
		} catch (Exception error) {
			throw new OneDriveOAuthServiceException(502, "ONEDRIVE_OAUTH_EXCHANGE_FAILED", "Microsoft 토큰 교환 실패");
		}
	}
	private String getClientId() { String v = System.getenv("MICROSOFT_CLIENT_ID"); if (v == null || v.isBlank()) throw new OneDriveOAuthServiceException(500, "MICROSOFT_CLIENT_ID_MISSING", "MICROSOFT_CLIENT_ID가 설정되지 않았습니다."); return v; }
	private String getClientSecret() { String v = System.getenv("MICROSOFT_CLIENT_SECRET"); if (v == null || v.isBlank()) throw new OneDriveOAuthServiceException(500, "MICROSOFT_CLIENT_SECRET_MISSING", "MICROSOFT_CLIENT_SECRET가 설정되지 않았습니다."); return v; }
	private String getRedirectUri() { String base = System.getenv("NEXT_PUBLIC_APP_URL"); if (base == null || base.isBlank()) base = "http://localhost:3000"; return base.replaceAll("/$", "") + "/counseling-service/api/v1/integrations/onedrive/auth/callback"; }
	private String enc(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
	private String extract(String json, String key) { var p = java.util.regex.Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]*)\""); var m = p.matcher(json); return m.find() ? m.group(1) : null; }
	private long extractLong(String json, String key) { var p = java.util.regex.Pattern.compile("\"" + key + "\"\\s*:\\s*(\\d+)"); var m = p.matcher(json); return m.find() ? Long.parseLong(m.group(1)) : 0L; }
}
