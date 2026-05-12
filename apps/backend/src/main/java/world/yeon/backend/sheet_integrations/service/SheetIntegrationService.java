package world.yeon.backend.sheet_integrations.service;

import java.io.ByteArrayInputStream;
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
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;

import world.yeon.backend.sheet_integrations.dto.CreateSheetIntegrationRequest;
import world.yeon.backend.sheet_integrations.dto.CreateSheetIntegrationResponse;
import world.yeon.backend.sheet_integrations.dto.GetSheetIntegrationsResponse;
import world.yeon.backend.sheet_integrations.dto.SheetIntegrationColumnMappingDto;
import world.yeon.backend.sheet_integrations.dto.SheetIntegrationResponse;
import world.yeon.backend.sheet_integrations.dto.SyncSheetIntegrationResponse;
import world.yeon.backend.sheet_integrations.repository.SheetIntegrationRepository;

@Service
public class SheetIntegrationService {

	private static final String SHEETS_URL = "https://sheets.googleapis.com/v4/spreadsheets";
	private static final String GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
	private static final String GOOGLE_SHEET_SOURCE = "google_sheet";

	private final SheetIntegrationRepository repository;
	private final HttpClient httpClient = HttpClient.newHttpClient();
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public SheetIntegrationService(SheetIntegrationRepository repository) {
		this.repository = repository;
	}

	public GetSheetIntegrationsResponse getIntegrations(String spaceId) {
		requireSpace(spaceId);
		return new GetSheetIntegrationsResponse(repository.findIntegrations(spaceId).stream().map(this::toResponse).toList());
	}

	public CreateSheetIntegrationResponse createIntegration(String spaceId, UUID userId, CreateSheetIntegrationRequest request) {
		Long spaceInternalId = requireSpace(spaceId);
		if (request == null || request.sheetUrl() == null || request.sheetUrl().isBlank()) {
			throw new IllegalArgumentException("sheetUrl은 필수입니다.");
		}
		if (request.dataType() == null || request.dataType().isBlank()) {
			throw new IllegalArgumentException("dataType은 필수입니다.");
		}
		String sheetId = extractSheetId(request.sheetUrl());
		String columnMappingJson = serializeColumnMapping(request.columnMapping());
		var created = repository.insertIntegration(
			spaceInternalId,
			generatePublicId("sht"),
			request.sheetUrl(),
			sheetId,
			request.dataType(),
			columnMappingJson,
			OffsetDateTime.now(ZoneOffset.UTC)
		);
		return new CreateSheetIntegrationResponse(toResponse(created));
	}

	public SyncSheetIntegrationResponse syncIntegration(String spaceId, String integrationId, UUID userId) {
		requireSpace(spaceId);
		var integration = repository.findIntegration(spaceId, integrationId);
		if (integration == null) {
			throw new SheetIntegrationServiceException(404, "SHEET_INTEGRATION_NOT_FOUND", "시트 연동을 찾지 못했습니다.");
		}
		List<List<String>> rows = fetchSheetValues(integration.sheetId());
		if (rows.isEmpty()) {
			return new SyncSheetIntegrationResponse(0, 0);
		}

		SheetIntegrationColumnMappingDto mapping = parseColumnMapping(integration.columnMapping());
		int nameColIdx = mapping != null && mapping.nameColumn() != null ? mapping.nameColumn() : 0;
		int dateColIdx = mapping != null && mapping.dateColumn() != null ? mapping.dateColumn() : 1;
		int statusColIdx = mapping != null && mapping.statusColumn() != null ? mapping.statusColumn() : 2;
		Integer typeColIdx = mapping == null ? null : mapping.typeColumn();
		List<List<String>> dataRows = rows.size() > 1 ? rows.subList(1, rows.size()) : List.of();

		int synced = 0;
		int errors = 0;
		for (var row : dataRows) {
			String memberName = getCell(row, nameColIdx).trim();
			String dateValue = getCell(row, dateColIdx).trim();
			String statusValue = normalizeBlank(getCell(row, statusColIdx));
			String typeValue = typeColIdx == null ? integration.dataType() : normalizeBlank(getCell(row, typeColIdx));

			if (memberName.isBlank() || dateValue.isBlank()) {
				errors++;
				continue;
			}

			OffsetDateTime recordedAt;
			try {
				recordedAt = parseRecordedAt(dateValue);
			} catch (Exception error) {
				errors++;
				continue;
			}

			Long memberInternalId = repository.findMemberInternalIdByName(integration.spaceInternalId(), memberName);
			if (memberInternalId == null) {
				errors++;
				continue;
			}

			String logType = typeValue == null || typeValue.isBlank() ? integration.dataType() : typeValue;
			if (repository.existsActivityLog(memberInternalId, recordedAt, logType)) {
				continue;
			}

			repository.insertActivityLog(
				generatePublicId("log"),
				memberInternalId,
				integration.spaceInternalId(),
				logType,
				statusValue,
				recordedAt,
				GOOGLE_SHEET_SOURCE
			);
			synced++;
		}

		repository.updateLastSyncedAt(integration.integrationInternalId(), OffsetDateTime.now(ZoneOffset.UTC));
		return new SyncSheetIntegrationResponse(synced, errors);
	}

	protected List<List<String>> fetchSheetValues(String sheetId) {
		String accessToken = getServiceAccountAccessToken();
		HttpRequest request = HttpRequest.newBuilder(URI.create(
			SHEETS_URL + "/" + url(sheetId) + "/values/" + url("A1:Z1000")
		))
			.header("Authorization", "Bearer " + accessToken)
			.GET()
			.build();
		try {
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new SheetIntegrationServiceException(502, "GOOGLE_SHEETS_API_ERROR", formatGoogleSheetsApiError(response.body()));
			}
			JsonNode parsed = objectMapper.readTree(response.body());
			JsonNode values = parsed.path("values");
			if (!values.isArray() || values.isEmpty()) {
				return List.of();
			}
			List<List<String>> rows = new ArrayList<>();
			for (JsonNode row : values) {
				List<String> cells = new ArrayList<>();
				for (JsonNode cell : row) {
					cells.add(cell.isNull() ? "" : cell.asText(""));
				}
				rows.add(List.copyOf(cells));
			}
			return rows;
		} catch (InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new SheetIntegrationServiceException(502, "GOOGLE_SHEETS_API_ERROR", "구글 시트 읽기 중 요청이 중단되었습니다.");
		} catch (IOException error) {
			throw new SheetIntegrationServiceException(502, "GOOGLE_SHEETS_API_ERROR", "구글 시트 읽기에 실패했습니다: " + error.getMessage());
		}
	}

	private Long requireSpace(String spaceId) {
		Long spaceInternalId = repository.findSpaceInternalId(spaceId);
		if (spaceInternalId == null) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}
		return spaceInternalId;
	}

	private String getServiceAccountAccessToken() {
		String raw = System.getenv("GOOGLE_SERVICE_ACCOUNT_KEY");
		if (raw == null || raw.isBlank()) {
			throw new SheetIntegrationServiceException(500, "GOOGLE_SERVICE_ACCOUNT_KEY_MISSING", "GOOGLE_SERVICE_ACCOUNT_KEY 환경변수가 설정되지 않았습니다. 서비스 계정 JSON을 환경변수로 등록해 주세요.");
		}
		try {
			GoogleCredentials credentials = GoogleCredentials
				.fromStream(new ByteArrayInputStream(raw.getBytes(StandardCharsets.UTF_8)))
				.createScoped(List.of(GOOGLE_SHEETS_SCOPE));
			credentials.refreshIfExpired();
			AccessToken token = credentials.getAccessToken();
			if (token == null || token.getTokenValue() == null || token.getTokenValue().isBlank()) {
				token = credentials.refreshAccessToken();
			}
			if (token == null || token.getTokenValue() == null || token.getTokenValue().isBlank()) {
				throw new SheetIntegrationServiceException(500, "GOOGLE_SERVICE_ACCOUNT_KEY_INVALID", "서비스 계정 access token을 발급하지 못했습니다.");
			}
			return token.getTokenValue();
		} catch (IOException error) {
			throw new SheetIntegrationServiceException(500, "GOOGLE_SERVICE_ACCOUNT_KEY_INVALID", "GOOGLE_SERVICE_ACCOUNT_KEY 환경변수가 올바른 JSON 형식이 아닙니다.");
		}
	}

	private SheetIntegrationResponse toResponse(SheetIntegrationRepository.SheetIntegrationRow row) {
		return new SheetIntegrationResponse(
			row.publicId(),
			row.sheetUrl(),
			row.sheetId(),
			row.dataType(),
			parseColumnMapping(row.columnMapping()),
			row.lastSyncedAt(),
			row.createdAt(),
			row.updatedAt()
		);
	}

	private SheetIntegrationColumnMappingDto parseColumnMapping(String raw) {
		if (raw == null || raw.isBlank() || "null".equals(raw)) return null;
		try {
			return objectMapper.readValue(raw, SheetIntegrationColumnMappingDto.class);
		} catch (Exception error) {
			throw new IllegalStateException("columnMapping을 해석하지 못했습니다.", error);
		}
	}

	private String serializeColumnMapping(SheetIntegrationColumnMappingDto columnMapping) {
		try {
			return objectMapper.writeValueAsString(columnMapping);
		} catch (Exception error) {
			throw new IllegalStateException("columnMapping을 직렬화하지 못했습니다.", error);
		}
	}

	private String extractSheetId(String sheetUrl) {
		var match = java.util.regex.Pattern.compile("/spreadsheets/d/([a-zA-Z0-9_-]+)").matcher(sheetUrl);
		if (!match.find() || match.group(1) == null || match.group(1).isBlank()) {
			throw new IllegalArgumentException("구글 시트 URL에서 시트 ID를 추출하지 못했습니다. URL 형식을 확인해 주세요.");
		}
		return match.group(1);
	}

	private String formatGoogleSheetsApiError(String rawText) {
		try {
			JsonNode parsed = objectMapper.readTree(rawText);
			String message = parsed.path("error").path("message").asText(null);
			if (message != null && !message.isBlank()) {
				return "구글 시트 읽기에 실패했습니다: " + message;
			}
		} catch (Exception ignore) {
		}
		return "구글 시트 읽기에 실패했습니다: " + rawText;
	}

	private String url(String value) {
		return URLEncoder.encode(value, StandardCharsets.UTF_8);
	}

	private OffsetDateTime parseRecordedAt(String raw) {
		try {
			return OffsetDateTime.parse(raw);
		} catch (Exception ignore) {
		}
		return java.time.Instant.parse(raw).atOffset(ZoneOffset.UTC);
	}

	private String getCell(List<String> row, int index) {
		if (index < 0 || index >= row.size()) return "";
		return row.get(index) == null ? "" : row.get(index);
	}

	private String normalizeBlank(String raw) {
		if (raw == null) return null;
		String trimmed = raw.trim();
		return trimmed.isBlank() ? null : trimmed;
	}

	private String generatePublicId(String prefix) {
		return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
	}
}
