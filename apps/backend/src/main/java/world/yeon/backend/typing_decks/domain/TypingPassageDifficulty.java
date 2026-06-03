package world.yeon.backend.typing_decks.domain;

/**
 * 연습 문장 난이도 허용값/정규화 도메인. 기존 normalizeDifficulty와 동일: null이면 기본값 "normal",
 * 그 외엔 트림 후 허용값 검증, 위반 시 동일 메시지.
 */
public enum TypingPassageDifficulty {
	EASY("easy"),
	NORMAL("normal"),
	HARD("hard");

	private static final String DEFAULT_VALUE = "normal";
	private static final String INVALID_MESSAGE = "난이도가 올바르지 않습니다.";

	private final String dbValue;

	TypingPassageDifficulty(String dbValue) {
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
		for (TypingPassageDifficulty difficulty : values()) {
			if (difficulty.dbValue.equals(value)) return true;
		}
		return false;
	}
}
