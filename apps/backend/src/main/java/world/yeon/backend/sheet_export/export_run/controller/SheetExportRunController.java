package world.yeon.backend.sheet_export.export_run.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import world.yeon.backend.sheet_export.export_run.dto.RunSheetExportRequest;
import world.yeon.backend.sheet_export.export_run.dto.RunSheetExportResponse;
import world.yeon.backend.sheet_export.export_run.service.SheetExportRunService;
import world.yeon.backend.sheet_export.export_run.service.SheetExportRunServiceException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
@RequestMapping("/spaces/{spaceId}/sheet-export/export-run")
public class SheetExportRunController {

	private final SheetExportRunService service;

	public SheetExportRunController(SheetExportRunService service) {
		this.service = service;
	}

	@PostMapping
	public RunSheetExportResponse run(
		@PathVariable String spaceId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody RunSheetExportRequest request
	) {
		return service.run(spaceId, userId, request);
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ApiErrorResponse> handleNotFound(NoSuchElementException error) {
		String code = "연동된 익스포트 시트를 찾지 못했습니다.".equals(error.getMessage()) ? "SHEET_INTEGRATION_NOT_FOUND" : "NOT_FOUND";
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiErrorResponses.ofCurrentRequest(code, error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.badRequest().body(ApiErrorResponses.ofCurrentRequest("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(SheetExportRunServiceException.class)
	public ResponseEntity<ApiErrorResponse> handleTransportError(SheetExportRunServiceException error) {
		return ResponseEntity.status(error.status()).body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage()));
	}
}
