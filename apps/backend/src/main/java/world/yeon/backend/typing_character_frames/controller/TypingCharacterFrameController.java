package world.yeon.backend.typing_character_frames.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import world.yeon.backend.typing_character_frames.dto.*;
import world.yeon.backend.typing_character_frames.service.TypingCharacterFrameService;

@Validated
@RestController
public class TypingCharacterFrameController {
	private final TypingCharacterFrameService service;

	public TypingCharacterFrameController(TypingCharacterFrameService service) {
		this.service = service;
	}

	@GetMapping("/typing-character-frames")
	public TypingCharacterFrameOverrideListResponse listOverrides() {
		return service.listOverrides();
	}

	@PutMapping("/typing-character-frames/{characterId}")
	public TypingCharacterFrameOverrideMutationResponse updateOverride(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId,
		@PathVariable String characterId,
		@RequestBody(required = false) UpdateTypingCharacterFrameOverrideRequest request
	) {
		return service.updateOverride(userId, characterId, request);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
