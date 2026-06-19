package world.yeon.backend.card_decks.merge_guest.controller;

import java.util.UUID;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestRequest;
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestResponse;
import world.yeon.backend.card_decks.merge_guest.service.MergeGuestCardDeckService;

@Validated
@RestController
public class MergeGuestCardDeckController {
	private final MergeGuestCardDeckService service;

	public MergeGuestCardDeckController(MergeGuestCardDeckService service) {
		this.service = service;
	}

	@PostMapping("/card-decks/merge-guest")
	public MergeGuestResponse merge(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody MergeGuestRequest request
	) {
		return service.merge(userId, request);
	}

}
