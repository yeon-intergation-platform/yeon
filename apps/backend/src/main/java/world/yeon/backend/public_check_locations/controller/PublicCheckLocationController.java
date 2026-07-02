package world.yeon.backend.public_check_locations.controller;

import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.public_check_locations.dto.PublicCheckLocationSearchResponse;
import world.yeon.backend.public_check_locations.service.PublicCheckLocationService;
import world.yeon.backend.public_check_locations.service.PublicCheckLocationServiceException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
public class PublicCheckLocationController {
	private final PublicCheckLocationService service;

	public PublicCheckLocationController(PublicCheckLocationService service) {
		this.service = service;
	}

	@GetMapping("/spaces/{spaceId}/public-check-locations")
	public PublicCheckLocationSearchResponse search(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@PathVariable String spaceId,
		@RequestParam(name = "query", defaultValue = "") String query
	) {
		return service.search(userId, spaceId, query);
	}

	@ExceptionHandler(PublicCheckLocationServiceException.class)
	public ResponseEntity<ApiErrorResponse> handleServiceError(PublicCheckLocationServiceException error) {
		return ResponseEntity.status(error.status()).body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage()));
	}
}
