package world.yeon.backend.sheet_integrations.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import world.yeon.backend.sheet_integrations.dto.CreateSheetIntegrationRequest;
import world.yeon.backend.sheet_integrations.dto.CreateSheetIntegrationResponse;
import world.yeon.backend.sheet_integrations.dto.GetSheetIntegrationsResponse;
import world.yeon.backend.sheet_integrations.dto.SyncSheetIntegrationResponse;
import world.yeon.backend.sheet_integrations.service.SheetIntegrationService;
import world.yeon.backend.sheet_integrations.service.SheetIntegrationServiceException;

@Validated
@RestController
@Profile("jdbc")
@RequestMapping("/spaces/{spaceId}/sheet-integrations")
public class SheetIntegrationController {

	private final SheetIntegrationService service;

	public SheetIntegrationController(SheetIntegrationService service) {
		this.service = service;
	}

	@GetMapping
	public GetSheetIntegrationsResponse getIntegrations(@PathVariable String spaceId, @RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.getIntegrations(spaceId);
	}

	@PostMapping
	public ResponseEntity<CreateSheetIntegrationResponse> createIntegration(
		@PathVariable String spaceId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody CreateSheetIntegrationRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createIntegration(spaceId, userId, request));
	}

	@PostMapping("/{integrationId}/sync")
	public SyncSheetIntegrationResponse syncIntegration(
		@PathVariable String spaceId,
		@PathVariable String integrationId,
		@RequestHeader("X-Yeon-User-Id") UUID userId
	) {
		return service.syncIntegration(spaceId, integrationId, userId);
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException error) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("SPACE_NOT_FOUND", error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(SheetIntegrationServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(SheetIntegrationServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
