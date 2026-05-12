package world.yeon.backend.typing_decks.controller;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.typing_decks.dto.CreateTypingDeckPassageRequest;
import world.yeon.backend.typing_decks.dto.CreateTypingDeckPassagesRequest;
import world.yeon.backend.typing_decks.dto.CreateTypingDeckPassagesResponse;
import world.yeon.backend.typing_decks.dto.CreateTypingDeckRequest;
import world.yeon.backend.typing_decks.dto.CreateTypingRaceSeedRequest;
import world.yeon.backend.typing_decks.dto.TypingDeckDetailResponse;
import world.yeon.backend.typing_decks.dto.TypingDeckListResponse;
import world.yeon.backend.typing_decks.dto.TypingDeckPassageResponse;
import world.yeon.backend.typing_decks.dto.TypingDeckResponse;
import world.yeon.backend.typing_decks.dto.TypingRaceSeedResponse;
import world.yeon.backend.typing_decks.dto.UpdateTypingDeckPassageRequest;
import world.yeon.backend.typing_decks.dto.UpdateTypingDeckRequest;
import world.yeon.backend.typing_decks.service.TypingDeckService;
import world.yeon.backend.typing_decks.service.TypingDeckServiceException;

@Validated
@RestController
@RequestMapping("/typing-decks")
public class TypingDeckController {
	private final TypingDeckService service;

	public TypingDeckController(TypingDeckService service) {
		this.service = service;
	}

	@GetMapping
	public TypingDeckListResponse listTypingDecks(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId,
		@RequestParam(value = "scope", required = false) String scope,
		@RequestParam(value = "languageTag", required = false) String languageTag,
		@RequestParam(value = "admin", defaultValue = "false") boolean adminMode
	) {
		return service.listTypingDecks(userId, scope, languageTag, adminMode);
	}

	@PostMapping
	public ResponseEntity<TypingDeckResponse> createTypingDeck(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId,
		@RequestParam(value = "admin", defaultValue = "false") boolean adminMode,
		@RequestBody CreateTypingDeckRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createTypingDeck(userId, request, adminMode));
	}

	@GetMapping("/{deckId}")
	public TypingDeckDetailResponse getTypingDeckDetail(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId,
		@PathVariable String deckId,
		@RequestParam(value = "admin", defaultValue = "false") boolean adminMode
	) {
		return service.getTypingDeckDetail(userId, deckId, adminMode);
	}

	@PatchMapping("/{deckId}")
	public TypingDeckResponse updateTypingDeck(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId,
		@PathVariable String deckId,
		@RequestParam(value = "admin", defaultValue = "false") boolean adminMode,
		@RequestBody JsonNode request
	) {
		return service.updateTypingDeck(userId, deckId, new UpdateTypingDeckRequest(request), adminMode);
	}

	@DeleteMapping("/{deckId}")
	public ResponseEntity<Void> deleteTypingDeck(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId,
		@PathVariable String deckId,
		@RequestParam(value = "admin", defaultValue = "false") boolean adminMode
	) {
		service.deleteTypingDeck(userId, deckId, adminMode);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{deckId}/passages")
	public ResponseEntity<TypingDeckPassageResponse> createTypingDeckPassage(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId,
		@PathVariable String deckId,
		@RequestParam(value = "admin", defaultValue = "false") boolean adminMode,
		@RequestBody CreateTypingDeckPassageRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createTypingDeckPassage(userId, deckId, request, adminMode));
	}

	@PostMapping("/{deckId}/passages/bulk")
	public ResponseEntity<CreateTypingDeckPassagesResponse> createTypingDeckPassages(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId,
		@PathVariable String deckId,
		@RequestParam(value = "admin", defaultValue = "false") boolean adminMode,
		@RequestBody CreateTypingDeckPassagesRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createTypingDeckPassages(userId, deckId, request, adminMode));
	}

	@PatchMapping("/{deckId}/passages/{passageId}")
	public TypingDeckPassageResponse updateTypingDeckPassage(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId,
		@PathVariable String deckId,
		@PathVariable String passageId,
		@RequestParam(value = "admin", defaultValue = "false") boolean adminMode,
		@RequestBody JsonNode request
	) {
		return service.updateTypingDeckPassage(userId, deckId, passageId, new UpdateTypingDeckPassageRequest(request), adminMode);
	}

	@DeleteMapping("/{deckId}/passages/{passageId}")
	public ResponseEntity<Void> deleteTypingDeckPassage(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId,
		@PathVariable String deckId,
		@PathVariable String passageId,
		@RequestParam(value = "admin", defaultValue = "false") boolean adminMode
	) {
		service.deleteTypingDeckPassage(userId, deckId, passageId, adminMode);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{deckId}/race-seed")
	public TypingRaceSeedResponse createTypingRaceSeed(
		@RequestHeader(value = "X-Yeon-User-Id", required = false) UUID userId,
		@PathVariable String deckId,
		@RequestBody(required = false) CreateTypingRaceSeedRequest request
	) {
		return service.createTypingRaceSeed(userId, deckId, request);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(TypingDeckServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(TypingDeckServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
