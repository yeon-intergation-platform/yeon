package world.yeon.backend.import_commit.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.import_commit.dto.ImportCommitRequest;
import world.yeon.backend.import_commit.dto.ImportCommitResponse;
import world.yeon.backend.import_commit.service.ImportCommitService;
import world.yeon.backend.import_commit.service.ImportCommitServiceException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
public class ImportCommitController {
	private final ImportCommitService service;
	public ImportCommitController(ImportCommitService service) { this.service = service; }
	@PostMapping("/import-commit")
	public ResponseEntity<ImportCommitResponse> commit(@RequestHeader("X-Yeon-User-Id") UUID userId, @RequestBody ImportCommitRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.commitImport(userId, request));
	}
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException error) { return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiErrorResponses.ofCurrentRequest("INVALID_REQUEST", error.getMessage())); }
	@ExceptionHandler(ImportCommitServiceException.class)
	public ResponseEntity<ApiErrorResponse> handleServiceError(ImportCommitServiceException error) { return ResponseEntity.status(error.status()).body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage())); }
}
