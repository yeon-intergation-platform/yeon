package world.yeon.backend.public_content.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleListResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentAdminArticleResponse;
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
}
