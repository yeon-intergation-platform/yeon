package world.yeon.backend.home_insight_banners.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import world.yeon.backend.home_insight_banners.dto.*;
import world.yeon.backend.home_insight_banners.service.HomeInsightBannerService;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
public class HomeInsightBannerController {
	private final HomeInsightBannerService service;
	public HomeInsightBannerController(HomeInsightBannerService service) { this.service = service; }
	@GetMapping("/home/insight-banners")
	public HomeInsightBannerStateResponse list(@RequestHeader("X-Yeon-User-Id") UUID userId) { return service.list(userId); }
	@PostMapping("/home/insight-banners/dismiss")
	public DismissHomeInsightBannerResponse dismiss(@RequestHeader("X-Yeon-User-Id") UUID userId, @RequestBody DismissHomeInsightBannerRequest request) { return service.dismiss(userId, request); }
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException error) { return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiErrorResponses.ofCurrentRequest("INVALID_REQUEST", error.getMessage())); }
}
