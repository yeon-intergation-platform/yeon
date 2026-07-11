package world.yeon.backend.card_decks.recall.controller;

import java.util.UUID;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.card_decks.recall.dto.CreateRecallAttemptRequest;
import world.yeon.backend.card_decks.recall.dto.RecallAttemptListResponse;
import world.yeon.backend.card_decks.recall.dto.RecallGradeResponse;
import world.yeon.backend.card_decks.recall.service.CardRecallService;

@Validated
@RestController
public class CardRecallController {
	private final CardRecallService service;

	public CardRecallController(CardRecallService service) {
		this.service = service;
	}

	@PostMapping("/card-decks/{deckId}/items/{itemId}/recall-attempts")
	public RecallGradeResponse createAttempt(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@PathVariable String deckId,
		@PathVariable String itemId,
		@RequestBody CreateRecallAttemptRequest request
	) {
		return service.grade(userId, deckId, itemId, request);
	}

	@GetMapping("/card-decks/{deckId}/recall-attempts")
	public RecallAttemptListResponse listAttempts(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@PathVariable String deckId,
		@RequestParam(defaultValue = "20") int limit
	) {
		return service.listAttempts(userId, deckId, limit);
	}
}
