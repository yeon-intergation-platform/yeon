package world.yeon.backend.sheet_export.export_run.service;

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

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.sheet_export.export_run.dto.RunSheetExportRequest;
import world.yeon.backend.sheet_export.export_run.dto.RunSheetExportResponse;
import world.yeon.backend.sheet_export.read.dto.SheetExportRowResponse;
import world.yeon.backend.sheet_export.read.service.SheetExportReadService;
import world.yeon.backend.sheet_export.snapshot.dto.ReplaceSheetExportSnapshotRowRequest;
import world.yeon.backend.sheet_export.snapshot.repository.SheetExportSnapshotRepository;
import world.yeon.backend.sheet_export.snapshot.service.SheetExportSnapshotService;
import world.yeon.backend.sheet_export.sync.dto.FinalizeSheetExportSyncRequest;

@Service
public class SheetExportRunService {

	private static final String SHEETS_URL = "https://sheets.googleapis.com/v4/spreadsheets";
	private static final String MEMBER_ID_COLUMN = "__yeon_member_id";
	private static final String EXPORTED_AT_COLUMN = "__yeon_exported_at";

	private final SheetExportReadService readService;
	private final SheetExportSnapshotRepository snapshotRepository;
	private final SheetExportSnapshotService snapshotService;
	private final HttpClient httpClient = HttpClient.newHttpClient();
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public SheetExportRunService(
		SheetExportReadService readService,
		SheetExportSnapshotRepository snapshotRepository,
		SheetExportSnapshotService snapshotService
	) {
		this.readService = readService;
		this.snapshotRepository = snapshotRepository;
		this.snapshotService = snapshotService;
	}

	public RunSheetExportResponse run(String spaceId, RunSheetExportRequest request) {
		if (request == null || request.sheetId() == null || request.sheetId().isBlank()) {
			throw new IllegalArgumentException("sheetId는 필수입니다.");
		}
		if (request.accessToken() == null || request.accessToken().isBlank()) {
			throw new IllegalArgumentException("accessToken은 필수입니다.");
		}
		if (snapshotRepository.findIntegration(spaceId, request.sheetId()) == null) {
			throw new java.util.NoSuchElementException("연동된 익스포트 시트를 찾지 못했습니다.");
		}

		var rowsResponse = readService.getRows(spaceId);
		OffsetDateTime exportedAt = OffsetDateTime.now(ZoneOffset.UTC);
		List<List<String>> values = buildSheetValues(rowsResponse.rows(), rowsResponse.fieldDefinitions().stream().map(field -> field.name()).toList(), exportedAt.toString());

		clearSheet(request.accessToken(), request.sheetId());
		writeSheetValues(request.accessToken(), request.sheetId(), values);

		var syncResult = snapshotService.finalizeSync(spaceId, new FinalizeSheetExportSyncRequest(
			request.sheetId(),
			exportedAt,
			rowsResponse.rows().stream().map(row -> new ReplaceSheetExportSnapshotRowRequest(row.memberId(), row.payload())).toList()
		));
		return new RunSheetExportResponse(syncResult.exportedCount(), syncResult.lastSyncedAt());
	}

	private List<List<String>> buildSheetValues(List<SheetExportRowResponse> rows, List<String> fieldNames, String exportedAt) {
		List<List<String>> values = new ArrayList<>();
		values.add(List.of(concatHeader(fieldNames)));
		for (var row : rows) {
			List<String> valueRow = new ArrayList<>(row.values());
			valueRow.add(row.memberId());
			valueRow.add(exportedAt);
			values.add(List.copyOf(valueRow));
		}
		return values;
	}

	private String[] concatHeader(List<String> fieldNames) {
		List<String> header = new ArrayList<>();
		header.add("이름");
		header.add("이메일");
		header.add("전화번호");
		header.add("수강 상태");
		header.add("위험도");
		header.add("등록일");
		header.addAll(fieldNames);
		header.add(MEMBER_ID_COLUMN);
		header.add(EXPORTED_AT_COLUMN);
		return header.toArray(String[]::new);
	}

	protected void clearSheet(String accessToken, String sheetId) {
		HttpRequest request = HttpRequest.newBuilder(URI.create(
			SHEETS_URL + "/" + url(sheetId) + "/values/A1:ZZ10000:clear"
		))
			.header("Authorization", "Bearer " + accessToken)
			.header("Content-Type", "application/json")
			.POST(HttpRequest.BodyPublishers.ofString("{}"))
			.build();
		String body = send(request, "구글 시트 초기화");
		if (body == null) return;
	}

	protected void writeSheetValues(String accessToken, String sheetId, List<List<String>> values) {
		String query = "valueInputOption=RAW";
		String requestBody;
		try {
			requestBody = objectMapper.writeValueAsString(java.util.Map.of("values", values));
		} catch (Exception error) {
			throw new IllegalStateException("구글 시트 payload를 직렬화하지 못했습니다.", error);
		}
		HttpRequest request = HttpRequest.newBuilder(URI.create(
			SHEETS_URL + "/" + url(sheetId) + "/values/A1?" + query
		))
			.header("Authorization", "Bearer " + accessToken)
			.header("Content-Type", "application/json")
			.PUT(HttpRequest.BodyPublishers.ofString(requestBody))
			.build();
		send(request, "구글 시트 쓰기");
	}

	private String send(HttpRequest request, String actionLabel) {
		try {
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new SheetExportRunServiceException(502, "GOOGLE_SHEETS_API_ERROR", formatGoogleSheetsApiError(response.body(), actionLabel));
			}
			return response.body();
		} catch (InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new SheetExportRunServiceException(502, "GOOGLE_SHEETS_API_ERROR", actionLabel + " 중 요청이 중단되었습니다.");
		} catch (IOException error) {
			throw new SheetExportRunServiceException(502, "GOOGLE_SHEETS_API_ERROR", actionLabel + "에 실패했습니다: " + error.getMessage());
		}
	}

	private String formatGoogleSheetsApiError(String rawText, String actionLabel) {
		try {
			var parsed = objectMapper.readTree(rawText);
			var details = parsed.path("error").path("details");
			for (var detail : details) {
				if ("SERVICE_DISABLED".equals(detail.path("reason").asText())) {
					String project = detail.path("metadata").path("consumer").asText("현재 Google Cloud 프로젝트");
					String activationUrl = detail.path("metadata").path("activationUrl").asText(null);
					String serviceTitle = detail.path("metadata").path("serviceTitle").asText("Google Sheets API");
					return serviceTitle + "가 비활성화되어 있어 " + actionLabel + "을 진행할 수 없습니다. "
						+ project + "에서 " + serviceTitle + "를 활성화한 뒤 몇 분 후 다시 시도해주세요."
						+ (activationUrl == null || activationUrl.isBlank() ? "" : " 활성화 링크: " + activationUrl);
				}
			}
			String message = parsed.path("error").path("message").asText(null);
			if (message != null && !message.isBlank()) {
				return actionLabel + "에 실패했습니다: " + message;
			}
		} catch (Exception ignore) {
		}
		return actionLabel + "에 실패했습니다: " + rawText;
	}

	private String url(String value) {
		return URLEncoder.encode(value, StandardCharsets.UTF_8);
	}
}
