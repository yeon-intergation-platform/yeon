package world.yeon.backend.card_rooms.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class CardRoomParticipantTokenServiceTests {

  @Test
  void 시크릿이없으면토큰을발급하지않는다() {
    var service = new CardRoomParticipantTokenService(new MockEnvironment());

    assertThat(service.issue("room_1", "participant_1")).isNull();
  }

  @Test
  void 발급토큰은roomId와participantId에묶인HMAC이다() throws Exception {
    var environment = new MockEnvironment();
    environment.setProperty("SPRING_INTERNAL_TOKEN", "shared-secret");
    var service = new CardRoomParticipantTokenService(environment);

    String token = service.issue("room_1", "participant_1");

    // race-server card-room-participant-token.ts와 동일한 payload/인코딩("roomId.participantId", base64url no-pad)을 고정한다.
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec("shared-secret".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
    String expected = Base64.getUrlEncoder().withoutPadding()
      .encodeToString(mac.doFinal("room_1.participant_1".getBytes(StandardCharsets.UTF_8)));

    assertThat(token).isEqualTo(expected);
  }

  @Test
  void 다른participantId는다른토큰을만든다() {
    var environment = new MockEnvironment();
    environment.setProperty("SPRING_INTERNAL_TOKEN", "shared-secret");
    var service = new CardRoomParticipantTokenService(environment);

    assertThat(service.issue("room_1", "participant_1"))
      .isNotEqualTo(service.issue("room_1", "participant_2"));
  }
}
