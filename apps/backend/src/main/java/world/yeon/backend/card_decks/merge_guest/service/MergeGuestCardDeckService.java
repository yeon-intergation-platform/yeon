package world.yeon.backend.card_decks.merge_guest.service;

import jakarta.transaction.Transactional;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestCardDeckItemRequest;
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestCardDeckRequest;
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestRequest;
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestResponse;
import world.yeon.backend.card_decks.merge_guest.repository.MergeGuestCardDeckRepository;

@Service
public class MergeGuestCardDeckService {
	private final MergeGuestCardDeckRepository repository;

	public MergeGuestCardDeckService(MergeGuestCardDeckRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public MergeGuestResponse merge(UUID userId, MergeGuestRequest request) {
		if (request == null || request.decks() == null || request.decks().isEmpty()) {
			throw new MergeGuestCardDeckServiceException(400, "INVALID_REQUEST", "이관할 덱 데이터가 올바르지 않습니다.");
		}

		int createdDeckCount = 0;
		int createdItemCount = 0;
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

		for (MergeGuestCardDeckRequest deck : request.decks()) {
			String title = trimToNull(deck.title(), 120);
			if (title == null) {
				throw new MergeGuestCardDeckServiceException(400, "EMPTY_DECK_TITLE", "덱 제목은 비워 둘 수 없습니다.");
			}
			String description = trimToNull(deck.description(), 2000);
			var insertedDeck = repository.insertDeck(generatePublicId("dck"), userId, title, description, now);
			createdDeckCount += 1;

			List<MergeGuestCardDeckItemRequest> items = deck.items() == null ? List.of() : deck.items();
			if (items.isEmpty()) {
				continue;
			}

			List<Object[]> insertRows = new ArrayList<>();
			for (MergeGuestCardDeckItemRequest item : items) {
				String frontText = trimToNull(item.frontText(), 2000);
				String backText = trimToNull(item.backText(), 2000);
				if (frontText == null || backText == null) {
					throw new MergeGuestCardDeckServiceException(
						400,
						"EMPTY_CARD_TEXT",
						"앞면과 뒷면이 모두 있는 카드만 이관할 수 있습니다. 빈 카드를 정리한 뒤 다시 시도해 주세요."
					);
				}
				insertRows.add(new Object[]{generatePublicId("dki"), frontText, backText});
			}
			createdItemCount += repository.insertItems(insertedDeck.id(), insertRows, now);
		}

		return new MergeGuestResponse(createdDeckCount, createdItemCount);
	}

	private String trimToNull(String raw, int max) {
		if (raw == null) return null;
		String trimmed = raw.trim();
		if (trimmed.isBlank()) return null;
		return trimmed.substring(0, Math.min(trimmed.length(), max));
	}

	private String generatePublicId(String prefix) {
		return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
	}
}
