package world.yeon.backend.oauth_token_security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Google Drive / OneDrive OAuth access·refresh 토큰을 봉투 암호화(AES/GCM)로 보호한다.
 *
 * <p>패턴은 {@code StarLobbySecretProtector}(AES/GCM, {@code v1:iv:ciphertext} 봉투)를 그대로 재사용하되
 * OAuth 토큰 저장 도메인에서 공용으로 쓸 수 있도록 별도 컴포넌트로 둔다. 키 소스도 StarLobby와 동일하게
 * {@code AUTH_SECRET}을 기본으로 사용하므로 운영 키를 한 곳에서 관리한다.
 *
 * <p>쓰기 시 {@link #protect(String)}로 ciphertext를 만들어 {@code *_encrypted} 컬럼에 저장하고
 * 읽기 시 {@link #reveal(String)}로 복호화한다. 쓰기/읽기 양쪽이 동일 봉투 포맷을 쓰므로 ciphertext 일관성이 유지된다.
 */
@Component
public class OAuthTokenSecretProtector {
	private static final String CIPHER_ALGORITHM = "AES/GCM/NoPadding";
	private static final int IV_LENGTH = 12;
	private static final int TAG_BITS = 128;
	private static final String VERSION = "v1";
	private static final String FALLBACK_SECRET = "yeon-local-oauth-token-secret";

	private final SecretKeySpec key;
	private final SecureRandom secureRandom = new SecureRandom();

	public OAuthTokenSecretProtector(Environment environment) {
		this.key = new SecretKeySpec(sha256(resolveSecret(environment)), "AES");
	}

	/** 평문 토큰을 {@code v1:iv:ciphertext} 봉투로 암호화한다. */
	public String protect(String value) {
		if (value == null) return null;
		try {
			byte[] iv = new byte[IV_LENGTH];
			secureRandom.nextBytes(iv);
			Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
			cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
			byte[] encrypted = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
			return VERSION + ":" + Base64.getEncoder().encodeToString(iv) + ":" + Base64.getEncoder().encodeToString(encrypted);
		} catch (Exception error) {
			throw new OAuthTokenSecretException(500, "OAUTH_TOKEN_PROTECT_FAILED", "OAuth 토큰을 보호하지 못했습니다.");
		}
	}

	/**
	 * 봉투 ciphertext를 복호화한다. ciphertext 컬럼이 비어 있으면(아직 암호화 전 평문만 있는 행 등) null을 반환해
	 * 호출자가 평문 컬럼 fallback을 결정할 수 있게 한다.
	 */
	public String reveal(String protectedValue) {
		if (protectedValue == null || protectedValue.isBlank()) return null;
		try {
			String[] parts = protectedValue.split(":", 3);
			if (parts.length != 3 || !VERSION.equals(parts[0])) throw new IllegalArgumentException("invalid payload");
			byte[] iv = Base64.getDecoder().decode(parts[1]);
			byte[] encrypted = Base64.getDecoder().decode(parts[2]);
			Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
			cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
			return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
		} catch (Exception error) {
			throw new OAuthTokenSecretException(500, "OAUTH_TOKEN_REVEAL_FAILED", "OAuth 토큰을 해석하지 못했습니다.");
		}
	}

	private String resolveSecret(Environment environment) {
		String specific = firstNonBlank(
			environment.getProperty("OAUTH_TOKEN_SECRET"),
			environment.getProperty("oauth.token.secret"),
			System.getenv("OAUTH_TOKEN_SECRET")
		);
		if (specific != null) return specific;

		String auth = firstNonBlank(
			environment.getProperty("AUTH_SECRET"),
			environment.getProperty("auth.secret"),
			System.getenv("AUTH_SECRET")
		);
		if (auth != null) return auth;

		return FALLBACK_SECRET;
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
			throw new OAuthTokenSecretException(500, "OAUTH_TOKEN_SECRET_KEY_FAILED", "OAuth 토큰 보호 키를 만들지 못했습니다.");
		}
	}
}
