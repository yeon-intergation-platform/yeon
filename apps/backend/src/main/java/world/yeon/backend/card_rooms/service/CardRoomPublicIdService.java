package world.yeon.backend.card_rooms.service;

import java.util.UUID;
import java.util.function.Function;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import world.yeon.backend.card_rooms.domain.CardRoomIdPrefix;

@Service
public class CardRoomPublicIdService {
  private static final int MAX_PUBLIC_ID_ATTEMPTS = 5;

  public String newPublicId(CardRoomIdPrefix prefix) {
    return prefix.value() + "_" + UUID.randomUUID().toString().replace("-", "");
  }

  public <T> T insertWithUniqueId(CardRoomIdPrefix prefix, Function<String, T> insert) {
    for (int attempt = 0; attempt < MAX_PUBLIC_ID_ATTEMPTS; attempt++) {
      try {
        return insert.apply(newPublicId(prefix));
      } catch (DuplicateKeyException ignored) {
        // public_id 충돌: 다음 시도에서 새 UUID 기반 id로 재생성한다.
      }
    }
    throw new CardRoomServiceException(409, "PUBLIC_ID_CONFLICT", "카드방 식별자 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }
}
