package world.yeon.backend.public_content.controller;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentArticleListResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentArticleResponse;
import world.yeon.backend.public_content.dto.PublicContentDtos.PublicContentSitemapResponse;
import world.yeon.backend.public_content.service.PublicContentService;
import world.yeon.backend.public_content.service.PublicContentServiceException;

@RestController
public class PublicContentController {
	private final PublicContentService service;

	public PublicContentController(PublicContentService service) {
		this.service = service;
	}

	@GetMapping("/api/v1/content")
	public PublicContentArticleListResponse listArticles(
		@RequestParam(value = "channel", required = false) String channel,
		@RequestParam(value = "serviceKey", required = false) String serviceKey,
		@RequestParam(value = "category", required = false) String category
	) {
		return service.listArticles(channel, serviceKey, category);
	}

	@GetMapping("/api/v1/content/{channel}/sitemap")
	public PublicContentSitemapResponse sitemap(@PathVariable String channel) {
		return service.getSitemap(channel);
	}

	@GetMapping("/api/v1/content/{channel}/**")
	public PublicContentArticleResponse article(
		@PathVariable String channel,
		HttpServletRequest request
	) {
		return service.getArticle(channel, extractSlug(request, channel));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(PublicContentServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(
		PublicContentServiceException error
	) {
		return ResponseEntity.status(error.status())
			.body(new ErrorResponse(error.code(), error.getMessage()));
	}

	private String extractSlug(HttpServletRequest request, String channel) {
		String prefix = request.getContextPath() + "/api/v1/content/" + channel + "/";
		String requestUri = request.getRequestURI();
		int prefixIndex = requestUri.indexOf(prefix);
		if (prefixIndex < 0) {
			throw new IllegalArgumentException("공개 콘텐츠 경로를 해석하지 못했습니다.");
		}

		String slug = requestUri.substring(prefixIndex + prefix.length());
		if (slug.isBlank()) {
			throw new IllegalArgumentException("공개 콘텐츠 slug를 입력해 주세요.");
		}

		return URLDecoder.decode(slug, StandardCharsets.UTF_8);
	}

	public record ErrorResponse(String code, String message) {}
}
