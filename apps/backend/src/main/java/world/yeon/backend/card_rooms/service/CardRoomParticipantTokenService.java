package world.yeon.backend.card_rooms.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

/**
 * 카드방 참가자 소유 증명 토큰을 발급한다.
 *
 * <p>finding 166: race-server가 클라이언트가 보낸 임의 participantId를 검증 없이 신뢰하면
 * 참가자 가장(impersonation)이 가능하다. 입장 시 백엔드가 (roomId, participantId)에 묶인
 * HMAC-SHA256 토큰을 발급하고, race-server가 동일 시크릿으로 재계산해 검증하면
 * 위조가 불가능하다. 시크릿은 백엔드/race-server가 이미 공유하는 SPRING_INTERNAL_TOKEN을
 * 재사용해 별도 DB 컬럼·마이그레이션·신규 엔드포인트 없이 stateless 하게 닫는다.
 */
@Service
public class CardRoomParticipantTokenService {
  private static final String HMAC_ALGORITHM = "HmacSHA256";
  private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();

  private final byte[] secret;

  public CardRoomParticipantTokenService(Environment environment) {
    this.secret = resolveSecret(environment).getBytes(StandardCharsets.UTF_8);
  }

  /**
   * (roomId, participantId)에 묶인 HMAC 토큰을 발급한다. 시크릿이 비어 있으면 토큰을 발급하지
   * 않는다(레거시/로컬 환경). race-server도 시크릿이 없으면 검증을 건너뛰므로 일관된 동작이다.
   */
  public String issue(String roomId, String participantId) {
    if (secret.length == 0 || roomId == null || participantId == null) {
      return null;
    }
    return sign(roomId, participantId);
  }

  private String sign(String roomId, String participantId) {
    try {
      Mac mac = Mac.getInstance(HMAC_ALGORITHM);
      mac.init(new SecretKeySpec(secret, HMAC_ALGORITHM));
      // race-server와 정확히 동일한 payload 포맷("roomId.participantId")을 사용한다.
      String payload = roomId + "." + participantId;
      byte[] signature = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
      return URL_ENCODER.encodeToString(signature);
    } catch (Exception error) {
      throw new IllegalStateException("참가자 토큰 발급에 실패했습니다.", error);
    }
  }

  private static String resolveSecret(Environment environment) {
    String fromProperty = environment.getProperty("SPRING_INTERNAL_TOKEN");
    if (fromProperty != null && !fromProperty.isBlank()) {
      return fromProperty;
    }
    String normalizedProperty = environment.getProperty("spring.internal.token");
    if (normalizedProperty != null && !normalizedProperty.isBlank()) {
      return normalizedProperty;
    }
    String fromEnv = System.getenv("SPRING_INTERNAL_TOKEN");
    return fromEnv == null ? "" : fromEnv;
  }
}
