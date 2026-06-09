package world.yeon.backend.typing_decks.service;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * race-seed HMAC 서명 전용 협력자. payload 문자열/이스케이프/알고리즘/Base64/`v1.` prefix/시크릿
 * 해석 순서는 race-server(apps/race-server)의 검증 로직과 바이트 단위로 일치해야 하므로, 이 클래스는
 * TypingDeckService에서 "그대로 이동"한 코드만 담는다. 표현을 바꾸지 않는다(ObjectMapper 등 금지).
 */
@Component
public class TypingRaceSeedSigner {
	private static final Base64.Encoder BASE64_URL = Base64.getUrlEncoder().withoutPadding();
	private final Environment environment;

	public TypingRaceSeedSigner(Environment environment) {
		this.environment = environment;
	}

	public String sign(UnsignedTypingRaceSeed seed) {
		// 시크릿 해석은 try 밖에서 한다. 시크릿 부재(fail-closed) 메시지가 아래 catch의
		// 일반 서명 실패 메시지로 가려지지 않게 하기 위함이다.
		String secret = getTypingRaceSeedSigningSecret();
		try {
			Mac mac = Mac.getInstance("HmacSHA256");
			mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
			byte[] digest = mac.doFinal(raceSeedSigningPayload(seed).getBytes(StandardCharsets.UTF_8));
			return "v1." + BASE64_URL.encodeToString(digest);
		} catch (GeneralSecurityException error) {
			throw new IllegalStateException("race seed 서명에 실패했습니다.", error);
		}
	}

	// race-server와 동일하게 TYPING_RACE_SEED_SECRET > AUTH_SECRET 순으로 해석한다. AuthTokenHasher와
	// 동일하게 Environment(프로퍼티 소스 + OS env)를 본다. 공개 하드코딩 fallback은 제거했다 — 시크릿이
	// 없으면 공개 문자열로 조용히 약한 서명을 만들지 않고 fail-closed로 거부한다. AuthTokenHasher가
	// 부팅 시 AUTH_SECRET(최소 길이)을 강제하므로 정상 기동 환경에서는 항상 해석된다.
	private String getTypingRaceSeedSigningSecret() {
		String typingSecret = firstNonBlank(
			environment.getProperty("TYPING_RACE_SEED_SECRET"),
			environment.getProperty("typing.race.seed.secret"),
			System.getenv("TYPING_RACE_SEED_SECRET"));
		if (typingSecret != null) return typingSecret;
		String authSecret = firstNonBlank(
			environment.getProperty("AUTH_SECRET"),
			environment.getProperty("auth.secret"),
			System.getenv("AUTH_SECRET"));
		if (authSecret != null) return authSecret;
		throw new IllegalStateException("race seed 서명 시크릿이 없습니다. TYPING_RACE_SEED_SECRET 또는 AUTH_SECRET을 설정해야 합니다.");
	}

	private static String firstNonBlank(String... values) {
		for (String value : values) {
			if (value != null && !value.trim().isBlank()) return value.trim();
		}
		return null;
	}

	private String raceSeedSigningPayload(UnsignedTypingRaceSeed seed) {
		return String.format(
			"{\"passageId\":\"%s\",\"prompt\":%s,\"roundLabel\":%s,\"deckId\":\"%s\",\"deckVisibility\":\"%s\",\"lobbyDeckTitle\":%s,\"participantDeckTitle\":%s,\"languageTag\":\"%s\"}",
			seed.passageId(),
			jsonString(seed.prompt()),
			jsonString(seed.roundLabel()),
			seed.deckId(),
			seed.deckVisibility(),
			jsonString(seed.lobbyDeckTitle()),
			jsonString(seed.participantDeckTitle()),
			seed.languageTag()
		);
	}

	// race-server는 서명 payload를 JS JSON.stringify로 만든다. 백엔드도 바이트 단위로 동일하게
	// 이스케이프해야 HMAC가 일치한다. 과거엔 \\ \" \n 3종만 처리해, 탭/CR 등 제어문자가 든 문장은
	// payload가 어긋나 검증 실패 → 사용자가 고른 덱 대신 데모 fallback이 나오는 무음 버그가 있었다.
	private String jsonString(String value) {
		if (value == null) return "null";
		StringBuilder sb = new StringBuilder(value.length() + 2);
		sb.append('"');
		for (int i = 0; i < value.length(); i++) {
			char c = value.charAt(i);
			switch (c) {
				case '"' -> sb.append("\\\"");
				case '\\' -> sb.append("\\\\");
				case '\b' -> sb.append("\\b");
				case '\f' -> sb.append("\\f");
				case '\n' -> sb.append("\\n");
				case '\r' -> sb.append("\\r");
				case '\t' -> sb.append("\\t");
				default -> {
					// JSON.stringify는 제어문자(0x00~0x1F) 중 위 특수문자 외에는 소문자 4자리 유니코드 이스케이프로 처리한다.
					if (c < 0x20) {
						sb.append(String.format("\\u%04x", (int) c));
					} else {
						sb.append(c);
					}
				}
			}
		}
		sb.append('"');
		return sb.toString();
	}

	public record UnsignedTypingRaceSeed(String passageId, String prompt, String roundLabel, String deckId, String deckVisibility, String lobbyDeckTitle, String participantDeckTitle, String languageTag) {}
}
