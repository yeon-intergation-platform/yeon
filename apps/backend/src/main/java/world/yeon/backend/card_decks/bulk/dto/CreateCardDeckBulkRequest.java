package world.yeon.backend.card_decks.bulk.dto;

import java.util.List;
import java.util.UUID;

public record CreateCardDeckBulkRequest(
	UUID idempotencyKey,
	String title,
	String description,
	List<CreateCardDeckBulkItemRequest> items
) {}
