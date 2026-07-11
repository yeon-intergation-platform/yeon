package world.yeon.backend.card_decks.support;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

public final class CardRequestIdentity {
	private CardRequestIdentity() {}

	public static String requireUuid(String value, String errorMessage) {
		String normalized = trimToNull(value);
		if (normalized == null) {
			throw new IllegalArgumentException(errorMessage);
		}
		try {
			return UUID.fromString(normalized).toString();
		} catch (IllegalArgumentException error) {
			throw new IllegalArgumentException(errorMessage, error);
		}
	}

	public static String uuidOrGenerate(String value) {
		String normalized = trimToNull(value);
		return normalized == null
			? UUID.randomUUID().toString()
			: requireUuid(normalized, "멱등성 키 형식이 올바르지 않습니다.");
	}

	public static String fingerprint(String... values) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			for (String value : values) {
				byte[] bytes = (value == null ? "" : value).getBytes(StandardCharsets.UTF_8);
				digest.update(Integer.toString(bytes.length).getBytes(StandardCharsets.US_ASCII));
				digest.update((byte) ':');
				digest.update(bytes);
				digest.update((byte) ';');
			}
			return java.util.HexFormat.of().formatHex(digest.digest());
		} catch (NoSuchAlgorithmException error) {
			throw new IllegalStateException("요청 지문을 생성하지 못했습니다.", error);
		}
	}

	private static String trimToNull(String value) {
		if (value == null) return null;
		String normalized = value.trim();
		return normalized.isEmpty() ? null : normalized;
	}
}
