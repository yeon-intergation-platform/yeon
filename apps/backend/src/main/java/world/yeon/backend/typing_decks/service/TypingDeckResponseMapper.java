package world.yeon.backend.typing_decks.service;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.stereotype.Component;
import world.yeon.backend.typing_decks.dto.TypingDeckDto;
import world.yeon.backend.typing_decks.dto.TypingDeckPassageDto;
import world.yeon.backend.typing_decks.repository.TypingDeckRepository;

@Component
public class TypingDeckResponseMapper {
	private static final String SOURCE_USER = "user";

	public TypingDeckDto toDeckDto(TypingDeckRepository.TypingDeckListRow row, UUID currentUserId, boolean adminMode) {
		return toDeckDto(
			new TypingDeckRepository.TypingDeckRow(
				row.internalId(),
				row.publicId(),
				row.ownerUserId(),
				row.title(),
				row.description(),
				row.languageTag(),
				row.visibility(),
				row.source(),
				row.createdAt(),
				row.updatedAt()
			),
			row.passageCount(),
			currentUserId,
			adminMode
		);
	}

	public TypingDeckDto toDeckDto(TypingDeckRepository.TypingDeckRow row, int passageCount, UUID currentUserId, boolean adminMode) {
		boolean isOwner = currentUserId != null && currentUserId.toString().equals(row.ownerUserId());
		boolean canManage = adminMode || isOwner;
		return new TypingDeckDto(
			row.publicId(),
			row.title(),
			row.description(),
			row.languageTag(),
			row.visibility(),
			row.source(),
			passageCount,
			isOwner,
			canManage && SOURCE_USER.equals(row.source()),
			toIso(row.createdAt()),
			toIso(row.updatedAt())
		);
	}

	public TypingDeckPassageDto toPassageDto(TypingDeckRepository.TypingDeckPassageRow row) {
		return new TypingDeckPassageDto(
			row.publicId(),
			row.title(),
			row.prompt(),
			row.textType(),
			row.difficulty(),
			row.sortOrder(),
			toIso(row.createdAt()),
			toIso(row.updatedAt())
		);
	}

	private String toIso(OffsetDateTime value) {
		return value == null ? null : value.toInstant().toString();
	}
}
