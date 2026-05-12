package world.yeon.backend.sheet_export.import_run.service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.googledrive_browser.service.GoogleDriveBrowserService;
import world.yeon.backend.sheet_export.export_run.dto.RunSheetExportRequest;
import world.yeon.backend.sheet_export.export_run.service.SheetExportRunService;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportEvaluationRequest;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportEvaluationResponse;
import world.yeon.backend.sheet_export.import_evaluation.dto.SheetExportImportPlannedMutationResponse;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationItemRequest;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationPayloadCoreRequest;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationPayloadRequest;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationRequest;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationValueRequest;
import world.yeon.backend.sheet_export.import_mutation.service.SheetExportImportMutationService;
import world.yeon.backend.sheet_export.import_evaluation.service.SheetExportImportEvaluationService;
import world.yeon.backend.sheet_export.import_run.dto.RunSheetImportRequest;
import world.yeon.backend.sheet_export.import_run.dto.RunSheetImportResponse;

@Service
public class SheetExportImportRunService {

	private static final String SHEETS_URL = "https://sheets.googleapis.com/v4/spreadsheets";

	private final SheetExportImportEvaluationService evaluationService;
	private final SheetExportImportMutationService mutationService;
	private final SheetExportRunService exportRunService;
	private final GoogleDriveBrowserService googleDriveBrowserService;
	private final HttpClient httpClient = HttpClient.newHttpClient();
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public SheetExportImportRunService(
		SheetExportImportEvaluationService evaluationService,
		SheetExportImportMutationService mutationService,
		SheetExportRunService exportRunService,
		GoogleDriveBrowserService googleDriveBrowserService
	) {
		this.evaluationService = evaluationService;
		this.mutationService = mutationService;
		this.exportRunService = exportRunService;
		this.googleDriveBrowserService = googleDriveBrowserService;
	}

	public RunSheetImportResponse run(String spaceId, java.util.UUID userId, RunSheetImportRequest request) {
		if (request == null || request.sheetId() == null || request.sheetId().isBlank()) {
			throw new IllegalArgumentException("sheetId는 필수입니다.");
		}
		String accessToken = googleDriveBrowserService.getValidAccessToken(userId);

		List<List<String>> rows = readSheetValues(accessToken, request.sheetId());
		SheetExportImportEvaluationResponse evaluation = evaluationService.evaluate(
			spaceId,
			new SheetExportImportEvaluationRequest(request.sheetId(), rows)
		);

		if ("blocked".equals(evaluation.status())) {
			return new RunSheetImportResponse(
				"blocked",
				evaluation.summary(),
				evaluation.conflicts(),
				evaluation.lastSyncedAt()
			);
		}

		mutationService.apply(
			spaceId,
			userId,
			new SheetExportImportMutationRequest(
				request.sheetId(),
				toMutationItems(evaluation.plannedCreates()),
				toMutationItems(evaluation.plannedUpdates())
			)
		);
		var exportResult = exportRunService.run(spaceId, userId, new RunSheetExportRequest(request.sheetId(), null));
		return new RunSheetImportResponse(
			"applied",
			evaluation.summary(),
			List.of(),
			exportResult.lastSyncedAt()
		);
	}

	protected List<List<String>> readSheetValues(String accessToken, String sheetId) {
		HttpRequest request = HttpRequest.newBuilder(URI.create(
			SHEETS_URL + "/" + url(sheetId) + "/values/" + url("A1:ZZ10000")
		))
			.header("Authorization", "Bearer " + accessToken)
			.GET()
			.build();
		try {
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new SheetExportImportRunServiceException(502, "GOOGLE_SHEETS_API_ERROR", formatGoogleSheetsApiError(response.body(), "구글 시트 읽기"));
			}
			var parsed = objectMapper.readTree(response.body());
			var values = parsed.path("values");
			if (!values.isArray() || values.isEmpty()) {
				return List.of();
			}
			List<List<String>> rows = new ArrayList<>();
			for (var row : values) {
				List<String> cells = new ArrayList<>();
				for (var cell : row) {
					cells.add(cell.isNull() ? "" : cell.asText(""));
				}
				rows.add(List.copyOf(cells));
			}
			return rows;
		} catch (InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new SheetExportImportRunServiceException(502, "GOOGLE_SHEETS_API_ERROR", "구글 시트 읽기 중 요청이 중단되었습니다.");
		} catch (IOException error) {
			throw new SheetExportImportRunServiceException(502, "GOOGLE_SHEETS_API_ERROR", "구글 시트 읽기에 실패했습니다: " + error.getMessage());
		}
	}

	private List<SheetExportImportMutationItemRequest> toMutationItems(List<SheetExportImportPlannedMutationResponse> mutations) {
		List<SheetExportImportPlannedMutationResponse> safe = mutations == null ? List.of() : mutations;
		return safe.stream().map(mutation -> new SheetExportImportMutationItemRequest(
			mutation.memberPublicId(),
			new SheetExportImportMutationPayloadRequest(
				new SheetExportImportMutationPayloadCoreRequest(
					mutation.payload().core().name(),
					mutation.payload().core().email(),
					mutation.payload().core().phone(),
					mutation.payload().core().status(),
					mutation.payload().core().initialRiskLevel()
				),
				mutation.payload().customFields()
			),
			mutation.customValues().stream().map(value -> new SheetExportImportMutationValueRequest(value.fieldDefinitionId(), value.value())).toList()
		)).toList();
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
