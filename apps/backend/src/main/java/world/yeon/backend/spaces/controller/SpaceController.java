package world.yeon.backend.spaces.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.spaces.dto.CreateSpaceRequest;
import world.yeon.backend.spaces.dto.OkResponse;
import world.yeon.backend.spaces.dto.SpaceListResponse;
import world.yeon.backend.spaces.dto.SpaceMutationResponse;
import world.yeon.backend.spaces.dto.UpdateSpaceRequest;
import world.yeon.backend.spaces.service.SpaceService;
import world.yeon.backend.spaces.service.SpaceServiceException;

@Validated
@RestController
public class SpaceController {
	private final SpaceService service;

	public SpaceController(SpaceService service) {
		this.service = service;
	}

	@GetMapping("/spaces")
	public SpaceListResponse listSpaces(@RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.listSpaces(userId);
	}

	@PostMapping("/spaces")
	public ResponseEntity<SpaceMutationResponse> createSpace(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody CreateSpaceRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createSpace(userId, request));
	}

	@GetMapping("/spaces/{spaceId}")
	public SpaceMutationResponse getSpace(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@PathVariable String spaceId
	) {
		return service.getSpace(userId, spaceId);
	}

	@PatchMapping("/spaces/{spaceId}")
	public SpaceMutationResponse updateSpace(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@PathVariable String spaceId,
		@RequestBody UpdateSpaceRequest request
	) {
		return service.updateSpace(userId, spaceId, request);
	}

	@DeleteMapping("/spaces/{spaceId}")
	public OkResponse deleteSpace(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@PathVariable String spaceId
	) {
		return service.deleteSpace(userId, spaceId);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(SpaceServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(SpaceServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
