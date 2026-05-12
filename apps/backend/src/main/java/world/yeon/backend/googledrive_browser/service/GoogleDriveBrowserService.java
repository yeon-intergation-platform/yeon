package world.yeon.backend.googledrive_browser.service;

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
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import world.yeon.backend.googledrive_browser.dto.GoogleDriveFileResponse;
import world.yeon.backend.googledrive_browser.dto.GoogleDriveFilesResponse;
import world.yeon.backend.googledrive_browser.dto.GoogleDriveStatusResponse;
import world.yeon.backend.googledrive_browser.repository.GoogleDriveBrowserRepository;

@Service
public class GoogleDriveBrowserService {
	private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
	private static final String TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";
	private static final String DRIVE_URL = "https://www.googleapis.com/drive/v3";
	private static final Set<String> SHEETS_REQUIRED_SCOPES = Set.of(
		"https://www.googleapis.com/auth/spreadsheets",
		"https://www.googleapis.com/auth/drive.file",
		"https://www.googleapis.com/auth/drive"
	);

	private final GoogleDriveBrowserRepository repository;
	private final HttpClient httpClient = HttpClient.newHttpClient();
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public GoogleDriveBrowserService(GoogleDriveBrowserRepository repository) {
		this.repository = repository;
	}

	public GoogleDriveStatusResponse getStatus(UUID userId) {
		var token = repository.findToken(userId);
		if (token == null) return new GoogleDriveStatusResponse(false, false);
		String accessToken = getValidAccessToken(userId);
		boolean sheetSyncReady = hasGoogleSheetsAccess(accessToken);
		return new GoogleDriveStatusResponse(true, sheetSyncReady);
	}

	public GoogleDriveFilesResponse listFiles(UUID userId, String folderId) {
		String accessToken = getValidAccessToken(userId);
		String parent = folderId != null && !folderId.isBlank() ? "'" + folderId + "' in parents" : "'root' in parents";
		String q = parent + " and trashed=false";
		String url = DRIVE_URL + "/files?q=" + url(q) + "&fields=" + url("files(id,name,size,modifiedTime,mimeType)") + "&pageSize=200&orderBy=" + url("folder,name");
		HttpRequest request = HttpRequest.newBuilder(URI.create(url)).header("Authorization", "Bearer " + accessToken).GET().build();
		String body = sendString(request, "Google Drive 파일 목록 조회 실패");
		try {
			JsonNode root = objectMapper.readTree(body);
			List<GoogleDriveFileResponse> files = new ArrayList<>();
			for (JsonNode file : root.path("files")) {
				files.add(new GoogleDriveFileResponse(
					file.path("id").asText(),
					file.path("name").asText(),
					parseInt(file.path("size").asText("0")),
					file.path("modifiedTime").asText(),
					file.path("mimeType").asText()
				));
			}
			return new GoogleDriveFilesResponse(files);
		} catch (IOException error) {
			throw new GoogleDriveBrowserServiceException(502, "GOOGLE_DRIVE_FILES_FAILED", "Google Drive 파일 목록을 해석하지 못했습니다.");
		}
	}

	public DownloadedFile downloadFile(UUID userId, String fileId, String mimeType) {
		String accessToken = getValidAccessToken(userId);
		boolean isGoogleSheet = "application/vnd.google-apps.spreadsheet".equals(mimeType);
		String url = isGoogleSheet
			? DRIVE_URL + "/files/" + fileId + "/export?mimeType=" + url("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
			: DRIVE_URL + "/files/" + fileId + "?alt=media";
		HttpRequest request = HttpRequest.newBuilder(URI.create(url)).header("Authorization", "Bearer " + accessToken).GET().build();
		byte[] body = sendBytes(request, "Google Drive 파일 다운로드 실패");
		String contentType = isGoogleSheet
			? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			: (mimeType == null || mimeType.isBlank() ? "application/octet-stream" : mimeType);
		return new DownloadedFile(body, contentType);
	}

	private boolean hasGoogleSheetsAccess(String accessToken) {
		String body = sendString(HttpRequest.newBuilder(URI.create(TOKEN_INFO_URL + "?access_token=" + url(accessToken))).GET().build(), "Google 권한 범위를 확인하지 못했습니다");
		try {
			String scopeText = objectMapper.readTree(body).path("scope").asText("");
			for (String scope : scopeText.split("\s+")) {
				if (SHEETS_REQUIRED_SCOPES.contains(scope.trim())) return true;
			}
			return false;
		} catch (IOException error) {
			throw new GoogleDriveBrowserServiceException(502, "GOOGLE_DRIVE_TOKENINFO_FAILED", "Google 권한 범위를 해석하지 못했습니다.");
		}
	}

	public String getValidAccessToken(UUID userId) {
		var row = repository.findToken(userId);
		if (row == null) {
			throw new GoogleDriveBrowserServiceException(401, "GOOGLE_DRIVE_NOT_CONNECTED", "Google Drive가 연결되어 있지 않습니다.");
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
		String body = "client_id=" + url(getClientId()) + "&client_secret=" + url(getClientSecret()) + "&refresh_token=" + url(refreshToken) + "&grant_type=refresh_token";
		HttpRequest request = HttpRequest.newBuilder(URI.create(TOKEN_URL))
			.header("Content-Type", "application/x-www-form-urlencoded")
			.POST(HttpRequest.BodyPublishers.ofString(body))
			.build();
		String response = sendString(request, "Google 토큰 갱신 실패");
		try {
			JsonNode data = objectMapper.readTree(response);
			String accessToken = data.path("access_token").asText("");
			String nextRefreshToken = data.path("refresh_token").asText("");
			int expiresIn = data.path("expires_in").asInt(0);
			if (accessToken.isBlank() || expiresIn <= 0) {
				throw new GoogleDriveBrowserServiceException(502, "GOOGLE_DRIVE_REFRESH_FAILED", "Google 토큰 갱신 응답이 올바르지 않습니다.");
			}
			return new RefreshedToken(accessToken, nextRefreshToken.isBlank() ? refreshToken : nextRefreshToken, OffsetDateTime.now(ZoneOffset.UTC).plusSeconds(expiresIn));
		} catch (IOException error) {
			throw new GoogleDriveBrowserServiceException(502, "GOOGLE_DRIVE_REFRESH_FAILED", "Google 토큰 갱신 응답을 해석하지 못했습니다.");
		}
	}

	private String sendString(HttpRequest request, String failureMessage) {
		try {
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new GoogleDriveBrowserServiceException(502, "GOOGLE_DRIVE_API_FAILED", failureMessage);
			}
			return response.body();
		} catch (InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new GoogleDriveBrowserServiceException(502, "GOOGLE_DRIVE_API_FAILED", failureMessage);
		} catch (IOException error) {
			throw new GoogleDriveBrowserServiceException(502, "GOOGLE_DRIVE_API_FAILED", failureMessage);
		}
	}

	private byte[] sendBytes(HttpRequest request, String failureMessage) {
		try {
			HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new GoogleDriveBrowserServiceException(502, "GOOGLE_DRIVE_API_FAILED", failureMessage);
			}
			return response.body();
		} catch (InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new GoogleDriveBrowserServiceException(502, "GOOGLE_DRIVE_API_FAILED", failureMessage);
		} catch (IOException error) {
			throw new GoogleDriveBrowserServiceException(502, "GOOGLE_DRIVE_API_FAILED", failureMessage);
		}
	}

	private String getClientId() {
		String value = System.getenv("GOOGLE_CLIENT_ID");
		if (value == null || value.isBlank()) throw new GoogleDriveBrowserServiceException(500, "GOOGLE_CLIENT_ID_MISSING", "GOOGLE_CLIENT_ID가 설정되지 않았습니다.");
		return value;
	}
	private String getClientSecret() {
		String value = System.getenv("GOOGLE_CLIENT_SECRET");
		if (value == null || value.isBlank()) throw new GoogleDriveBrowserServiceException(500, "GOOGLE_CLIENT_SECRET_MISSING", "GOOGLE_CLIENT_SECRET가 설정되지 않았습니다.");
		return value;
	}
	private String url(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
	private int parseInt(String value) { try { return Integer.parseInt(value); } catch (Exception e) { return 0; } }

	public record DownloadedFile(byte[] bytes, String contentType) {}
	private record RefreshedToken(String accessToken, String refreshToken, OffsetDateTime expiresAt) {}
}
