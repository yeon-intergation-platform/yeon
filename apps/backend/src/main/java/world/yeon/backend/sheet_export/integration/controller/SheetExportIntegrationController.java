package world.yeon.backend.sheet_export.integration.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import world.yeon.backend.sheet_export.integration.dto.DeleteSheetExportIntegrationResponse;
import world.yeon.backend.sheet_export.integration.dto.GetSheetExportIntegrationResponse;
import world.yeon.backend.sheet_export.integration.dto.UpsertSheetExportIntegrationRequest;
import world.yeon.backend.sheet_export.integration.dto.UpsertSheetExportIntegrationResponse;
import world.yeon.backend.sheet_export.integration.service.SheetExportIntegrationService;
import world.yeon.backend.sheet_export.integration.service.SheetExportIntegrationServiceException;

@Validated
@RestController
@RequestMapping("/spaces/{spaceId}/sheet-export/integration")
public class SheetExportIntegrationController {

	private final SheetExportIntegrationService service;

	public SheetExportIntegrationController(SheetExportIntegrationService service) {
		this.service = service;
	}

	@GetMapping
	public GetSheetExportIntegrationResponse getIntegration(@PathVariable String spaceId, @RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.getIntegration(spaceId);
	}

	@PutMapping
	public ResponseEntity<UpsertSheetExportIntegrationResponse> upsertIntegration(
		@PathVariable String spaceId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody UpsertSheetExportIntegrationRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.upsertIntegration(spaceId, userId, request));
	}

	@DeleteMapping
	public DeleteSheetExportIntegrationResponse deleteIntegration(@PathVariable String spaceId, @RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.deleteIntegration(spaceId, userId);
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException error) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("SPACE_NOT_FOUND", error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(SheetExportIntegrationServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(SheetExportIntegrationServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
