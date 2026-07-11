package world.yeon.backend.card_decks.generation.controller;

import java.util.UUID;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.card_decks.generation.dto.CardDeckAiPreviewRequest;
import world.yeon.backend.card_decks.generation.dto.CardDeckAiPreviewResponse;
import world.yeon.backend.card_decks.generation.service.CardDeckAiPreviewService;

@Validated
@RestController
public class CardDeckAiPreviewController {
	private final CardDeckAiPreviewService service;

	public CardDeckAiPreviewController(CardDeckAiPreviewService service) {
		this.service = service;
	}

	@PostMapping("/card-decks/ai-previews")
	public CardDeckAiPreviewResponse createPreview(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody CardDeckAiPreviewRequest request
	) {
		return service.create(userId, request);
	}
}
