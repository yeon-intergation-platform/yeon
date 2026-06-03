package world.yeon.backend.typing_decks.domain;

/**
 * 타자 덱 공개 범위 허용값/정규화 도메인. 기존 서비스의 normalizeVisibility 동작과 동일하다:
 * null이면 기본값 "private", 그 외엔 트림 후 허용값 검증, 위반 시 동일 메시지.
 */
public enum TypingDeckVisibility {
	PUBLIC("public"),
	PRIVATE("private");

	private static final String DEFAULT_VALUE = "private";
	private static final String INVALID_MESSAGE = "공개 범위가 올바르지 않습니다.";

	private final String dbValue;

	TypingDeckVisibility(String dbValue) {
		this.dbValue = dbValue;
	}

	public String dbValue() {
		return dbValue;
	}

	public static String normalize(String value) {
		String normalized = value == null ? DEFAULT_VALUE : value.trim();
		if (!isAllowed(normalized)) {
			throw new IllegalArgumentException(INVALID_MESSAGE);
		}
		return normalized;
	}

	private static boolean isAllowed(String value) {
		for (TypingDeckVisibility visibility : values()) {
			if (visibility.dbValue.equals(value)) return true;
		}
		return false;
	}
}
