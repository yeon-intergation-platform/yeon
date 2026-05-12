package world.yeon.backend.onedrive_browser.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import world.yeon.backend.onedrive_browser.dto.OneDriveFileResponse;
import world.yeon.backend.onedrive_browser.dto.OneDriveFilesResponse;
import world.yeon.backend.onedrive_browser.dto.OneDriveStatusResponse;
import world.yeon.backend.onedrive_browser.repository.OneDriveBrowserRepository;

@Service
public class OneDriveBrowserService {
	private static final String TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
	private static final String GRAPH_URL = "https://graph.microsoft.com/v1.0";
	private static final String SCOPES = String.join(" ", "Files.ReadWrite.All", "offline_access", "User.Read");

	private final OneDriveBrowserRepository repository;
	private final HttpClient httpClient = HttpClient.newHttpClient();
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public OneDriveBrowserService(OneDriveBrowserRepository repository) {
		this.repository = repository;
	}

	public OneDriveStatusResponse getStatus(UUID userId) {
		return new OneDriveStatusResponse(repository.findToken(userId) != null);
	}

	public OneDriveFilesResponse listFiles(UUID userId, String folderId) {
		String accessToken = getValidAccessToken(userId);
		String endpoint = folderId != null && !folderId.isBlank()
			? GRAPH_URL + "/me/drive/items/" + folderId + "/children"
			: GRAPH_URL + "/me/drive/root/children";
		HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint + "?$select=id,name,size,lastModifiedDateTime,file&$top=200"))
			.header("Authorization", "Bearer " + accessToken)
			.GET()
			.build();
		String body = sendString(request, "OneDrive 파일 목록 조회 실패");
		try {
			JsonNode root = objectMapper.readTree(body);
			List<OneDriveFileResponse> files = new ArrayList<>();
			for (JsonNode item : root.path("value")) {
				files.add(new OneDriveFileResponse(
					item.path("id").asText(),
					item.path("name").asText(),
					item.path("size").asInt(0),
					item.path("lastModifiedDateTime").asText(),
					item.path("file").path("mimeType").asText("")
				));
			}
			return new OneDriveFilesResponse(files);
		} catch (IOException error) {
			throw new OneDriveBrowserServiceException(502, "ONEDRIVE_FILES_FAILED", "OneDrive 파일 목록을 해석하지 못했습니다.");
		}
	}

	public DownloadedFile downloadFile(UUID userId, String fileId, String requestedMimeType) {
		String accessToken = getValidAccessToken(userId);
		HttpRequest request = HttpRequest.newBuilder(URI.create(GRAPH_URL + "/me/drive/items/" + fileId + "/content"))
			.header("Authorization", "Bearer " + accessToken)
			.GET()
			.build();
		try {
			HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw oneDriveApiError(response.statusCode(), "OneDrive 파일 다운로드 실패", null);
			}
			String contentType = response.headers().firstValue("content-type")
				.filter(v -> !v.isBlank())
				.orElse(requestedMimeType == null || requestedMimeType.isBlank() ? "application/octet-stream" : requestedMimeType);
			return new DownloadedFile(response.body(), contentType);
		} catch (InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new OneDriveBrowserServiceException(502, "ONEDRIVE_DOWNLOAD_FAILED", "OneDrive 파일 다운로드 실패");
		} catch (IOException error) {
			throw new OneDriveBrowserServiceException(502, "ONEDRIVE_DOWNLOAD_FAILED", "OneDrive 파일 다운로드 실패");
		}
	}

	private String getValidAccessToken(UUID userId) {
		var row = repository.findToken(userId);
		if (row == null) {
			throw new OneDriveBrowserServiceException(401, "ONEDRIVE_NOT_CONNECTED", "OneDrive가 연결되어 있지 않습니다.");
		}
		OffsetDateTime fiveMinutesFromNow = OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(5);
		if (row.expiresAt() != null && row.expiresAt().isAfter(fiveMinutesFromNow)) {
			return row.accessToken();
		}
		RefreshedToken refreshed = refreshAccessToken(row.refreshToken());
		repository.updateTokens(userId, refreshed.accessToken(), refreshed.refreshToken(), refreshed.expiresAt(), OffsetDateTime.now(ZoneOffset.UTC));
		return refreshed.accessToken();
	}

	private RefreshedToken refreshAccessToken(String refreshToken) {
		String body = "client_id=" + url(getClientId())
			+ "&client_secret=" + url(getClientSecret())
			+ "&refresh_token=" + url(refreshToken)
			+ "&grant_type=refresh_token"
			+ "&scope=" + url(SCOPES);
		HttpRequest request = HttpRequest.newBuilder(URI.create(TOKEN_URL))
			.header("Content-Type", "application/x-www-form-urlencoded")
			.POST(HttpRequest.BodyPublishers.ofString(body))
			.build();
		String response = sendString(request, "Microsoft 토큰 갱신 실패");
		try {
			JsonNode data = objectMapper.readTree(response);
			String accessToken = data.path("access_token").asText("");
			String nextRefreshToken = data.path("refresh_token").asText("");
			int expiresIn = data.path("expires_in").asInt(0);
			if (accessToken.isBlank() || expiresIn <= 0) {
				throw new OneDriveBrowserServiceException(502, "ONEDRIVE_REFRESH_FAILED", "Microsoft 토큰 갱신 응답이 올바르지 않습니다.");
			}
			return new RefreshedToken(accessToken, nextRefreshToken.isBlank() ? refreshToken : nextRefreshToken, OffsetDateTime.now(ZoneOffset.UTC).plusSeconds(expiresIn));
		} catch (IOException error) {
			throw new OneDriveBrowserServiceException(502, "ONEDRIVE_REFRESH_FAILED", "Microsoft 토큰 갱신 응답을 해석하지 못했습니다.");
		}
	}

	private String sendString(HttpRequest request, String failureMessage) {
		try {
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw oneDriveApiError(response.statusCode(), failureMessage, response.body());
			}
			return response.body();
		} catch (InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new OneDriveBrowserServiceException(502, "ONEDRIVE_API_FAILED", failureMessage);
		} catch (IOException error) {
			throw new OneDriveBrowserServiceException(502, "ONEDRIVE_API_FAILED", failureMessage);
		}
	}

	private OneDriveBrowserServiceException oneDriveApiError(int statusCode, String failureMessage, String rawBody) {
		if (statusCode == 401 || statusCode == 403) {
			String code = extractGraphErrorCode(rawBody);
			if ("accessDenied".equals(code)) {
				return new OneDriveBrowserServiceException(403, "ONEDRIVE_PERSONAL_VAULT_LOCKED", "이 폴더는 Personal Vault로 보호되어 있어 접근할 수 없습니다. OneDrive 앱에서 직접 잠금을 해제한 뒤 다시 시도해 주세요.");
			}
			return new OneDriveBrowserServiceException(403, "ONEDRIVE_ACCESS_DENIED", "OneDrive 접근 권한이 없습니다. 다시 연결해 주세요.");
		}
		return new OneDriveBrowserServiceException(502, "ONEDRIVE_API_FAILED", failureMessage);
	}

	private String extractGraphErrorCode(String rawBody) {
		if (rawBody == null || rawBody.isBlank()) return null;
		try {
			return objectMapper.readTree(rawBody).path("error").path("code").asText(null);
		} catch (IOException ignored) {
			return null;
		}
	}

	private String getClientId() {
		String value = System.getenv("MICROSOFT_CLIENT_ID");
		if (value == null || value.isBlank()) throw new OneDriveBrowserServiceException(500, "MICROSOFT_CLIENT_ID_MISSING", "MICROSOFT_CLIENT_ID가 설정되지 않았습니다.");
		return value;
	}

	private String getClientSecret() {
		String value = System.getenv("MICROSOFT_CLIENT_SECRET");
		if (value == null || value.isBlank()) throw new OneDriveBrowserServiceException(500, "MICROSOFT_CLIENT_SECRET_MISSING", "MICROSOFT_CLIENT_SECRET가 설정되지 않았습니다.");
		return value;
	}

	private String url(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }

	public record DownloadedFile(byte[] bytes, String contentType) {}
	private record RefreshedToken(String accessToken, String refreshToken, OffsetDateTime expiresAt) {}
}
