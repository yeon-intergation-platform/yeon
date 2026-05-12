package world.yeon.backend.onedrive_browser.controller;

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
import world.yeon.backend.onedrive_browser.dto.OneDriveFilesResponse;
import world.yeon.backend.onedrive_browser.dto.OneDriveStatusResponse;
import world.yeon.backend.onedrive_browser.service.OneDriveBrowserService;
import world.yeon.backend.onedrive_browser.service.OneDriveBrowserServiceException;

@Validated
@RestController
public class OneDriveBrowserController {
	private final OneDriveBrowserService service;

	public OneDriveBrowserController(OneDriveBrowserService service) {
		this.service = service;
	}

	@GetMapping("/onedrive/status")
	public OneDriveStatusResponse getStatus(@RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.getStatus(userId);
	}

	@GetMapping("/onedrive/files")
	public OneDriveFilesResponse listFiles(@RequestHeader("X-Yeon-User-Id") UUID userId, @RequestParam(value = "folderId", required = false) String folderId) {
		return service.listFiles(userId, folderId);
	}

	@GetMapping("/onedrive/files/{fileId}/content")
	public ResponseEntity<byte[]> downloadFile(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String fileId, @RequestParam(value = "mimeType", required = false) String mimeType) {
		var downloaded = service.downloadFile(userId, fileId, mimeType == null ? "" : mimeType);
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, downloaded.contentType()).body(downloaded.bytes());
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.badRequest().body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(OneDriveBrowserServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(OneDriveBrowserServiceException error) {
		return ResponseEntity.status(error.status()).contentType(MediaType.APPLICATION_JSON).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
