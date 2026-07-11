package world.yeon.backend.card_decks.ai;

import java.util.List;

public interface CardLearningAiGateway {
	GradeResult grade(String question, String referenceAnswer, String userAnswer);

	GeneratedDeck generateDeck(String sourceText, String instruction, int itemCount);

	record GradeResult(
		int score,
		String verdict,
		List<String> missedPoints,
		String feedback,
		String model,
		Integer inputTokens,
		Integer outputTokens,
		long latencyMs
	) {
		public GradeResult {
			missedPoints = missedPoints == null ? List.of() : List.copyOf(missedPoints);
		}

		public AiUsage usage() {
			return AiUsage.from(inputTokens, outputTokens);
		}
	}

	record GeneratedDeck(
		String title,
		String description,
		List<GeneratedCard> items,
		String model,
		Integer inputTokens,
		Integer outputTokens,
		long latencyMs
	) {
		public GeneratedDeck {
			items = items == null ? List.of() : List.copyOf(items);
		}

		public AiUsage usage() {
			return AiUsage.from(inputTokens, outputTokens);
		}
	}

	record GeneratedCard(String frontText, String backText) {}

	record AiUsage(Integer inputTokens, Integer outputTokens, Integer totalTokens) {
		static AiUsage from(Integer inputTokens, Integer outputTokens) {
			Integer total = inputTokens == null || outputTokens == null ? null : inputTokens + outputTokens;
			return new AiUsage(inputTokens, outputTokens, total);
		}
	}
}
