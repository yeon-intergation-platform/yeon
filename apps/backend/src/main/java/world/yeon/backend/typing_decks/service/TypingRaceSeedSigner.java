package world.yeon.backend.typing_decks.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

/**
 * race-seed HMAC 서명 전용 협력자. payload 문자열/이스케이프/알고리즘/Base64/`v1.` prefix/시크릿
 * 해석 순서는 race-server(apps/race-server)의 검증 로직과 바이트 단위로 일치해야 하므로, 이 클래스는
 * TypingDeckService에서 "그대로 이동"한 코드만 담는다. 표현을 바꾸지 않는다(ObjectMapper 등 금지).
 */
@Component
public class TypingRaceSeedSigner {
	private static final String RACE_SEED_FALLBACK_SECRET = "yeon-local-typing-race-seed-secret";
	private static final Base64.Encoder BASE64_URL = Base64.getUrlEncoder().withoutPadding();

	public String sign(UnsignedTypingRaceSeed seed) {
		try {
			Mac mac = Mac.getInstance("HmacSHA256");
			mac.init(new SecretKeySpec(getTypingRaceSeedSigningSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
			byte[] digest = mac.doFinal(raceSeedSigningPayload(seed).getBytes(StandardCharsets.UTF_8));
			return "v1." + BASE64_URL.encodeToString(digest);
		} catch (Exception error) {
			throw new IllegalStateException("race seed 서명에 실패했습니다.", error);
		}
	}

	private String getTypingRaceSeedSigningSecret() {
		String raw = System.getenv("TYPING_RACE_SEED_SECRET");
		if (raw != null && !raw.trim().isBlank()) return raw.trim();
		raw = System.getenv("AUTH_SECRET");
		if (raw != null && !raw.trim().isBlank()) return raw.trim();
		return RACE_SEED_FALLBACK_SECRET;
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
