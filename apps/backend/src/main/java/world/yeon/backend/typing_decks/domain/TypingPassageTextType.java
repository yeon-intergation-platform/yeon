package world.yeon.backend.typing_decks.domain;

/**
 * 연습 문장 유형 허용값/정규화 도메인. 기존 normalizeTextType과 동일: null이면 기본값 "short",
 * 그 외엔 트림 후 허용값 검증, 위반 시 동일 메시지.
 */
public enum TypingPassageTextType {
	SHORT("short"),
	LONG("long"),
	CODE("code");

	private static final String DEFAULT_VALUE = "short";
	private static final String INVALID_MESSAGE = "문장 유형이 올바르지 않습니다.";

	private final String dbValue;

	TypingPassageTextType(String dbValue) {
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
		for (TypingPassageTextType textType : values()) {
			if (textType.dbValue.equals(value)) return true;
		}
		return false;
	}
}
