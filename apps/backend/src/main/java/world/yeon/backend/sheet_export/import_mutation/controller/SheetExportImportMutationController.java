package world.yeon.backend.sheet_export.import_mutation.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationRequest;
import world.yeon.backend.sheet_export.import_mutation.dto.SheetExportImportMutationResponse;
import world.yeon.backend.sheet_export.import_mutation.service.SheetExportImportMutationService;
import world.yeon.backend.sheet_export.import_mutation.service.SheetExportImportMutationServiceException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
@RequestMapping("/spaces/{spaceId}/sheet-export/import-mutation")
public class SheetExportImportMutationController {

	private final SheetExportImportMutationService service;

	public SheetExportImportMutationController(SheetExportImportMutationService service) {
		this.service = service;
	}

	@PostMapping
	public SheetExportImportMutationResponse apply(
		@PathVariable String spaceId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody SheetExportImportMutationRequest request
	) {
		return service.apply(spaceId, userId, request);
	}

	@ExceptionHandler(SheetExportImportMutationServiceException.class)
	public ResponseEntity<ApiErrorResponse> handleServiceError(SheetExportImportMutationServiceException error) {
		return ResponseEntity.status(error.status())
			.body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage()));
	}

}
