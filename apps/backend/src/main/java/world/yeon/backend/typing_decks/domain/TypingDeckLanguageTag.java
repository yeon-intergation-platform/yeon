package world.yeon.backend.typing_decks.domain;

/**
 * 타자 덱 언어 태그 허용값과 정규화를 담는 도메인. card_rooms/domain 선례를 모방해 raw Set<String> +
 * 짝 정규화를 값 객체로 승격했다. 허용값/정규화 결과(트림)/위반 메시지는 기존 서비스 동작과 동일하다.
 */
public enum TypingDeckLanguageTag {
	KO("ko"),
	EN("en"),
	MIXED("mixed"),
	CODE("code");

	private static final String INVALID_MESSAGE = "언어 태그가 올바르지 않습니다.";

	private final String dbValue;

	TypingDeckLanguageTag(String dbValue) {
		this.dbValue = dbValue;
	}

	public String dbValue() {
		return dbValue;
	}

	/** required: null/blank 또는 미허용값이면 IllegalArgumentException. 통과 시 트림된 허용 문자열을 반환. */
	public static String normalize(String value) {
		String normalized = value == null ? null : value.trim();
		if (normalized == null || !isAllowed(normalized)) {
			throw new IllegalArgumentException(INVALID_MESSAGE);
		}
		return normalized;
	}

	/** optional: null/blank면 null, 값이 있으면 required 정규화. */
	public static String normalizeOptional(String value) {
		if (value == null || value.isBlank()) return null;
		return normalize(value);
	}

	private static boolean isAllowed(String value) {
		for (TypingDeckLanguageTag tag : values()) {
			if (tag.dbValue.equals(value)) return true;
		}
		return false;
	}
}
