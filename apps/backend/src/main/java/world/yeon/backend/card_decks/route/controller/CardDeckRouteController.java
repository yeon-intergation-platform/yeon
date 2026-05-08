package world.yeon.backend.card_decks.route.controller;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import world.yeon.backend.card_decks.route.dto.*;
import world.yeon.backend.card_decks.route.service.CardDeckRouteService;
import world.yeon.backend.card_decks.route.service.CardDeckRouteServiceException;

@Validated
@RestController
@Profile("jdbc")
public class CardDeckRouteController {
	private final CardDeckRouteService service;

	public CardDeckRouteController(CardDeckRouteService service) {
		this.service = service;
	}

	@GetMapping("/card-decks")
	public CardDeckListResponse listDecks(@RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.listDecks(userId);
	}

	@PostMapping("/card-decks")
	public ResponseEntity<CardDeckResponse> createDeck(@RequestHeader("X-Yeon-User-Id") UUID userId, @RequestBody CreateCardDeckRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createDeck(userId, request));
	}

	@GetMapping("/card-decks/{deckId}")
	public CardDeckDetailResponse getDeck(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String deckId) {
		return service.getDeckDetail(userId, deckId);
	}

	@PatchMapping("/card-decks/{deckId}")
	public CardDeckResponse updateDeck(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String deckId, @RequestBody JsonNode request) {
		return service.updateDeck(userId, deckId, new UpdateCardDeckRequest(request));
	}

	@DeleteMapping("/card-decks/{deckId}")
	public ResponseEntity<Void> deleteDeck(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String deckId) {
		service.deleteDeck(userId, deckId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/card-decks/{deckId}/items")
	public ResponseEntity<CardDeckItemResponse> createItem(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String deckId, @RequestBody CreateCardDeckItemRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createItem(userId, deckId, request));
	}

	@PostMapping("/card-decks/{deckId}/items/bulk")
	public ResponseEntity<CreateCardDeckItemsResponse> createItems(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String deckId, @RequestBody CreateCardDeckItemsRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createItems(userId, deckId, request));
	}

	@PatchMapping("/card-decks/{deckId}/items/{itemId}")
	public CardDeckItemResponse updateItem(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String deckId, @PathVariable String itemId, @RequestBody JsonNode request) {
		return service.updateItem(userId, deckId, itemId, new UpdateCardDeckItemRequest(request));
	}

	@DeleteMapping("/card-decks/{deckId}/items/{itemId}")
	public ResponseEntity<Void> deleteItem(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String deckId, @PathVariable String itemId) {
		service.deleteItem(userId, deckId, itemId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/card-decks/study-preference")
	public CardStudyPreferenceResponse getStudyPreference(@RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.getStudyPreference(userId);
	}

	@PatchMapping("/card-decks/study-preference")
	public CardStudyPreferenceResponse updateStudyPreference(@RequestHeader("X-Yeon-User-Id") UUID userId, @RequestBody UpdateCardStudyPreferenceRequest request) {
		return service.updateStudyPreference(userId, request);
	}

	@PostMapping("/card-decks/{deckId}/items/{itemId}/review")
	public CardDeckItemResponse reviewItem(@RequestHeader("X-Yeon-User-Id") UUID userId, @PathVariable String deckId, @PathVariable String itemId, @RequestBody ReviewCardDeckItemRequest request) {
		return service.reviewItem(userId, deckId, itemId, request);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	@ExceptionHandler(CardDeckRouteServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(CardDeckRouteServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
