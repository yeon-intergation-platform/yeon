package world.yeon.backend.star_lobby.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class StarLobbySecretProtector {
	private static final String CIPHER_ALGORITHM = "AES/GCM/NoPadding";
	private static final int IV_LENGTH = 12;
	private static final int TAG_BITS = 128;
	private static final String FALLBACK_SECRET = "yeon-local-star-lobby-discord-webhook-secret";

	private final SecretKeySpec key;
	private final SecureRandom secureRandom = new SecureRandom();
	private final boolean configuredSecret;
	private final boolean persistentWritesAllowed;

	public StarLobbySecretProtector(Environment environment) {
		ResolvedSecret resolved = resolveSecret(environment);
		this.key = new SecretKeySpec(sha256(resolved.value()), "AES");
		this.configuredSecret = resolved.configured();
		this.persistentWritesAllowed = resolved.configured() || isLocalOrTest(environment);
	}

	public String protect(String value) {
		requirePersistentWritesAllowed();
		try {
			byte[] iv = new byte[IV_LENGTH];
			secureRandom.nextBytes(iv);
			Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
			cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
			byte[] encrypted = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
			return "v1:" + Base64.getEncoder().encodeToString(iv) + ":" + Base64.getEncoder().encodeToString(encrypted);
		} catch (Exception error) {
			throw new StarLobbyServiceException(500, "STAR_LOBBY_SECRET_PROTECT_FAILED", "Discord 웹훅 정보를 보호하지 못했습니다.");
		}
	}

	public String reveal(String protectedValue) {
		try {
			String[] parts = protectedValue.split(":", 3);
			if (parts.length != 3 || !"v1".equals(parts[0])) throw new IllegalArgumentException("invalid payload");
			byte[] iv = Base64.getDecoder().decode(parts[1]);
			byte[] encrypted = Base64.getDecoder().decode(parts[2]);
			Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
			cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
			return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
		} catch (Exception error) {
			throw new StarLobbyServiceException(500, "STAR_LOBBY_SECRET_REVEAL_FAILED", "Discord 웹훅 정보를 해석하지 못했습니다.");
		}
	}

	public boolean hasConfiguredSecret() {
		return configuredSecret;
	}

	public boolean allowsPersistentWrites() {
		return persistentWritesAllowed;
	}

	public void requirePersistentWritesAllowed() {
		if (persistentWritesAllowed) return;
		throw new StarLobbyServiceException(503, "STAR_LOBBY_DISCORD_SECRET_REQUIRED", "Discord 웹훅 저장용 보호 키가 아직 설정되지 않았습니다. 운영 확인 페이지의 테스트 발송은 사용할 수 있습니다.");
	}

	private boolean isLocalOrTest(Environment environment) {
		return Arrays.stream(environment.getActiveProfiles())
			.map(String::toLowerCase)
			.anyMatch(profile -> profile.equals("local") || profile.equals("test") || profile.equals("dev"));
	}

	private ResolvedSecret resolveSecret(Environment environment) {
		String specific = firstNonBlank(
			environment.getProperty("STAR_LOBBY_DISCORD_WEBHOOK_SECRET"),
			environment.getProperty("star-lobby.discord.webhook-secret"),
			System.getenv("STAR_LOBBY_DISCORD_WEBHOOK_SECRET")
		);
		if (specific != null) return new ResolvedSecret(specific, true);

		String auth = firstNonBlank(
			environment.getProperty("AUTH_SECRET"),
			environment.getProperty("auth.secret"),
			System.getenv("AUTH_SECRET")
		);
		if (auth != null) return new ResolvedSecret(auth, true);

		return new ResolvedSecret(FALLBACK_SECRET, false);
	}

	private String firstNonBlank(String... values) {
		for (String value : values) {
			if (value != null && !value.trim().isBlank()) return value.trim();
		}
		return null;
	}

	private byte[] sha256(String value) {
		try {
			return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
		} catch (Exception error) {
			throw new StarLobbyServiceException(500, "STAR_LOBBY_SECRET_KEY_FAILED", "Discord 웹훅 보호 키를 만들지 못했습니다.");
		}
	}

	private record ResolvedSecret(String value, boolean configured) {}
}
