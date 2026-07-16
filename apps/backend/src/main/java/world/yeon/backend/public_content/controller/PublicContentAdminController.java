package world.yeon.backend.public_content.controller;

import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleListResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleWriteRequest;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentRevisionListResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentTransitionRequest;
import world.yeon.backend.public_content.service.PublicContentExportFile;
import world.yeon.backend.public_content.service.PublicContentAdminService;
import world.yeon.backend.public_content.service.PublicContentServiceException;

@RestController
@RequestMapping("/api/v1/admin/content")
public class PublicContentAdminController {
	private final PublicContentAdminService service;

	public PublicContentAdminController(PublicContentAdminService service) {
		this.service = service;
	}

	@GetMapping
	public PublicContentAdminArticleListResponse listArticles(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID callerUserId,
		@RequestParam(value = "channel", required = false) String channel,
		@RequestParam(value = "serviceKey", required = false) String serviceKey,
		@RequestParam(value = "category", required = false) String category,
		@RequestParam(value = "status", required = false) String status,
		@RequestParam(value = "visibility", required = false) String visibility
	) {
		return service.listArticles(
			callerUserId,
			channel,
			serviceKey,
			category,
			status,
			visibility
		);
	}

	@GetMapping("/{articleId}")
	public PublicContentAdminArticleResponse article(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID callerUserId,
		@PathVariable String articleId
	) {
		return service.getArticle(callerUserId, articleId);
	}

	@PostMapping
	public ResponseEntity<PublicContentAdminArticleResponse> createArticle(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID callerUserId,
		@RequestBody PublicContentAdminArticleWriteRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(service.createArticle(callerUserId, request));
	}

	@PatchMapping("/{articleId}")
	public PublicContentAdminArticleResponse updateArticle(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID callerUserId,
		@PathVariable String articleId,
		@RequestBody PublicContentAdminArticleWriteRequest request
	) {
		return service.updateArticle(callerUserId, articleId, request);
	}

	@DeleteMapping("/{articleId}")
	public ResponseEntity<Void> deleteArticle(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID callerUserId,
		@PathVariable String articleId,
		@RequestParam("version") long version
	) {
		service.deleteArticle(callerUserId, articleId, version);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{articleId}/review")
	public PublicContentAdminArticleResponse requestReview(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID callerUserId,
		@PathVariable String articleId,
		@RequestBody PublicContentTransitionRequest request
	) {
		return service.requestReview(callerUserId, articleId, request.version());
	}

	@PostMapping("/{articleId}/publish")
	public PublicContentAdminArticleResponse publish(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID callerUserId,
		@PathVariable String articleId,
		@RequestBody PublicContentTransitionRequest request
	) {
		return service.publish(callerUserId, articleId, request.version());
	}

	@PostMapping("/{articleId}/archive")
	public PublicContentAdminArticleResponse archive(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID callerUserId,
		@PathVariable String articleId,
		@RequestBody PublicContentTransitionRequest request
	) {
		return service.archive(callerUserId, articleId, request.version());
	}

	@PostMapping("/{articleId}/restore")
	public PublicContentAdminArticleResponse restore(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID callerUserId,
		@PathVariable String articleId,
		@RequestBody PublicContentTransitionRequest request
	) {
		return service.restore(callerUserId, articleId, request.version());
	}

	@GetMapping("/{articleId}/revisions")
	public PublicContentRevisionListResponse revisions(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID callerUserId,
		@PathVariable String articleId
	) {
		return service.listRevisions(callerUserId, articleId);
	}

	@GetMapping("/{articleId}/export")
	public ResponseEntity<byte[]> exportArticle(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID callerUserId,
		@PathVariable String articleId
	) {
		return download(service.exportArticle(callerUserId, articleId));
	}

	@GetMapping("/export")
	public ResponseEntity<byte[]> exportArticles(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID callerUserId,
		@RequestParam(value = "channel", required = false) String channel
	) {
		return download(service.exportArticles(callerUserId, channel));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleBadRequest(
		IllegalArgumentException error
	) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(ApiErrorResponses.ofCurrentRequest("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(PublicContentServiceException.class)
	public ResponseEntity<ApiErrorResponse> handleServiceError(
		PublicContentServiceException error
	) {
		return ResponseEntity.status(error.status())
			.body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage()));
	}

	private ResponseEntity<byte[]> download(PublicContentExportFile file) {
		return ResponseEntity.ok()
			.header(
				HttpHeaders.CONTENT_DISPOSITION,
				"attachment; filename=\"" + file.filename() + "\""
			)
			.contentType(MediaType.parseMediaType(file.contentType()))
			.body(file.content());
	}
}
