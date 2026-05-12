package world.yeon.backend.sheet_export.import_context.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import world.yeon.backend.sheet_export.import_context.dto.SheetExportImportContextResponse;
import world.yeon.backend.sheet_export.import_context.service.SheetExportImportContextService;

@Validated
@RestController
@RequestMapping("/spaces/{spaceId}/sheet-export/import-context")
public class SheetExportImportContextController {

	private final SheetExportImportContextService service;

	public SheetExportImportContextController(SheetExportImportContextService service) {
		this.service = service;
	}

	@GetMapping
	public SheetExportImportContextResponse getContext(
		@PathVariable String spaceId,
		@RequestParam String sheetId,
		@RequestHeader("X-Yeon-User-Id") UUID userId
	) {
		return service.getContext(spaceId, sheetId);
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException error) {
		String code = "연동된 익스포트 시트를 찾지 못했습니다.".equals(error.getMessage()) ? "SHEET_INTEGRATION_NOT_FOUND" : "NOT_FOUND";
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(code, error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
