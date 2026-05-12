package world.yeon.backend.space_access.controller;

import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.space_access.service.SpaceAccessService;

@Validated
@RestController
public class SpaceAccessController {
	private final SpaceAccessService service;
	public SpaceAccessController(SpaceAccessService service) { this.service = service; }
	@GetMapping("/spaces/{spaceId}/ownership-check")
	public OkResponse check(@PathVariable String spaceId, @RequestHeader("X-Yeon-User-Id") UUID userId) {
		service.requireOwnedSpace(spaceId, userId);
		return new OkResponse(true);
	}
	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException error) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("SPACE_NOT_FOUND", error.getMessage()));
	}
	public record OkResponse(boolean ok) {}
	public record ErrorResponse(String code, String message) {}
}
