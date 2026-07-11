package world.yeon.backend.card_decks.ai_usage.domain;

import java.time.Duration;

public enum CardAiFeature {
	// 입력 최대 길이와 모델 출력 상한을 기준으로, 동시 요청도 일일 예산을 넘지 않게 예약한다.
	RECALL_GRADE("recall_grade", 30, Duration.ofHours(1), 64_000),
	DECK_GENERATION("card_deck_generate", 10, Duration.ofHours(1), 32_000);

	private final String value;
	private final int limit;
	private final Duration window;
	private final int maximumReservedTokens;

	CardAiFeature(String value, int limit, Duration window, int maximumReservedTokens) {
		this.value = value;
		this.limit = limit;
		this.window = window;
		this.maximumReservedTokens = maximumReservedTokens;
	}

	public String value() {
		return value;
	}

	public int limit() {
		return limit;
	}

	public Duration window() {
		return window;
	}

	public int maximumReservedTokens() {
		return maximumReservedTokens;
	}
}
