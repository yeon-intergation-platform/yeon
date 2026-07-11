package world.yeon.backend.card_decks.recall.service;

import world.yeon.backend.card_decks.recall.dto.RecallAttemptResponse;
import world.yeon.backend.card_decks.recall.dto.RecallGradeResponse;
import world.yeon.backend.card_decks.recall.repository.CardRecallRepository;

final class CardRecallResponses {
	private CardRecallResponses() {}

	static RecallGradeResponse toGradeResponse(CardRecallRepository.AttemptRow row) {
		return new RecallGradeResponse(
			row.publicId(),
			row.score(),
			row.verdict(),
			row.missedPoints(),
			row.feedback(),
			row.reviewDifficulty(),
			toIso(row.lastReviewedAt()),
			toIso(row.nextReviewAt()),
			toIso(row.createdAt())
		);
	}

	static RecallAttemptResponse toAttemptResponse(CardRecallRepository.AttemptRow row) {
		return new RecallAttemptResponse(
			row.publicId(),
			row.score(),
			row.verdict(),
			row.missedPoints(),
			row.feedback(),
			row.reviewDifficulty(),
			toIso(row.lastReviewedAt()),
			toIso(row.nextReviewAt()),
			toIso(row.createdAt()),
			row.deckPublicId(),
			row.itemPublicId(),
			row.question(),
			row.answer(),
			row.userAnswer()
		);
	}

	private static String toIso(java.time.OffsetDateTime value) {
		return value.toInstant().toString();
	}
}
