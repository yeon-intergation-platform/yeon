package world.yeon.backend.card_decks.merge_guest.controller;

import java.util.UUID;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestRequest;
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestResponse;
import world.yeon.backend.card_decks.merge_guest.service.MergeGuestCardDeckService;
import world.yeon.backend.card_decks.merge_guest.service.MergeGuestCardDeckServiceException;

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

	@ExceptionHandler(MergeGuestCardDeckServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(MergeGuestCardDeckServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {}
}
