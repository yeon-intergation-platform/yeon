package world.yeon.backend.googledrive_browser.controller;

import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.googledrive_browser.dto.GoogleDriveFilesResponse;
import world.yeon.backend.googledrive_browser.dto.GoogleDriveStatusResponse;
import world.yeon.backend.googledrive_browser.service.GoogleDriveBrowserService;
import world.yeon.backend.googledrive_browser.service.GoogleDriveBrowserServiceException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
public class GoogleDriveBrowserController {
	private final GoogleDriveBrowserService service;

	public GoogleDriveBrowserController(GoogleDriveBrowserService service) {
		this.service = service;
	}

	@GetMapping("/googledrive/status")
	public GoogleDriveStatusResponse getStatus(@RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.getStatus(userId);
	}

	@GetMapping("/googledrive/files")
	public GoogleDriveFilesResponse listFiles(@RequestHeader("X-Yeon-User-Id") UUID userId, @RequestParam(value = "folderId", required = false) String folderId) {
		return service.listFiles(userId, folderId);
	}

	@GetMapping("/googledrive/files/{fileId}/content")
	public ResponseEntity<byte[]> downloadFile(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String fileId, @RequestParam(value = "mimeType", required = false) String mimeType) {
		var downloaded = service.downloadFile(userId, fileId, mimeType == null ? "" : mimeType);
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, downloaded.contentType()).body(downloaded.bytes());
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.badRequest().body(ApiErrorResponses.ofCurrentRequest("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(GoogleDriveBrowserServiceException.class)
	public ResponseEntity<ApiErrorResponse> handleServiceError(GoogleDriveBrowserServiceException error) {
		return ResponseEntity.status(error.status()).contentType(MediaType.APPLICATION_JSON).body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage()));
	}
}
