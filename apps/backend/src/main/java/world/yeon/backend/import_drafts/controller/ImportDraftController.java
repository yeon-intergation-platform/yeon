package world.yeon.backend.import_drafts.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import world.yeon.backend.import_drafts.dto.*;
import world.yeon.backend.import_drafts.service.ImportDraftService;
import world.yeon.backend.import_drafts.service.ImportDraftServiceException;

@Validated
@RestController
public class ImportDraftController {
	private final ImportDraftService service;
	public ImportDraftController(ImportDraftService service) { this.service = service; }

	@GetMapping("/import-drafts")
	public ListImportDraftsResponse listDrafts(@RequestHeader("X-Yeon-User-Id") UUID userId, @RequestParam(required = false) String provider, @RequestParam(required = false) List<String> statuses, @RequestParam(required = false) Integer limit) {
		return service.listDrafts(userId, provider, statuses, limit);
	}

	@GetMapping("/import-drafts/{draftId}")
	public ImportDraftSnapshotResponse getDraft(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String draftId) { return service.getDraft(userId, draftId); }

	@PatchMapping("/import-drafts/{draftId}/preview")
	public OkResponse patchPreview(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String draftId, @RequestBody PatchImportDraftPreviewRequest request) { return service.patchPreview(userId, draftId, request); }

	@DeleteMapping("/import-drafts/{draftId}")
	public OkResponse deleteDraft(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String draftId) { return service.deleteDraft(userId, draftId); }

	@GetMapping("/import-drafts/{draftId}/file")
	public ImportDraftFileResponse getDraftFile(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String draftId) { return service.getDraftFile(userId, draftId); }

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) { return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage())); }
	@ExceptionHandler(ImportDraftServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(ImportDraftServiceException error) { return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage())); }
	public record ErrorResponse(String code, String message) {}
}
