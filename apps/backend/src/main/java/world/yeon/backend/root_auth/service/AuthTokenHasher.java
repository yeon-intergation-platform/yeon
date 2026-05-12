package world.yeon.backend.root_auth.service;

import java.nio.charset.StandardCharsets;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class AuthTokenHasher {
	private static final String HMAC_ALGORITHM = "HmacSHA256";
	private final Environment environment;

	public AuthTokenHasher(Environment environment) {
		this.environment = environment;
	}

	public String hash(String token) {
		String secret = resolveAuthSecret();
		try {
			Mac mac = Mac.getInstance(HMAC_ALGORITHM);
			mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
			byte[] digest = mac.doFinal(token.getBytes(StandardCharsets.UTF_8));
			return toHex(digest);
		} catch (Exception error) {
			throw new AuthSessionServiceException(500, "AUTH_HASH_FAILED", "인증 세션 토큰을 검증하지 못했습니다.");
		}
	}

	private String resolveAuthSecret() {
		String fromProperty = environment.getProperty("AUTH_SECRET");
		if (fromProperty != null && !fromProperty.trim().isBlank()) {
			return fromProperty.trim();
		}

		String normalizedProperty = environment.getProperty("auth.secret");
		if (normalizedProperty != null && !normalizedProperty.trim().isBlank()) {
			return normalizedProperty.trim();
		}

		String fromEnv = System.getenv("AUTH_SECRET");
		if (fromEnv != null && !fromEnv.trim().isBlank()) {
			return fromEnv.trim();
		}

		throw new AuthSessionServiceException(500, "AUTH_SECRET_MISSING", "AUTH_SECRET 환경변수가 필요합니다.");
	}

	private String toHex(byte[] bytes) {
		StringBuilder builder = new StringBuilder(bytes.length * 2);
		for (byte value : bytes) {
			builder.append(String.format("%02x", value & 0xff));
		}
		return builder.toString();
	}
}
