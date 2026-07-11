package world.yeon.backend.card_decks.bulk.controller;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.card_decks.bulk.dto.CreateCardDeckBulkRequest;
import world.yeon.backend.card_decks.bulk.dto.CreateCardDeckBulkResponse;
import world.yeon.backend.card_decks.bulk.service.CardDeckBulkService;

@Validated
@RestController
public class CardDeckBulkController {
	private final CardDeckBulkService service;

	public CardDeckBulkController(CardDeckBulkService service) {
		this.service = service;
	}

	@PostMapping("/card-decks/bulk")
	public ResponseEntity<CreateCardDeckBulkResponse> create(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody CreateCardDeckBulkRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.create(userId, request));
	}
}
