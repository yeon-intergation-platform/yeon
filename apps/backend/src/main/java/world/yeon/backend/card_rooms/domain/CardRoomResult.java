package world.yeon.backend.card_rooms.domain;

import java.util.Optional;

// 카드별 결과 값(finding 20). 더 이상 방 status로 매핑하지 않는다.
// 결과는 card_room_results에만 기록되고, 방 status는 IN_PROGRESS를 유지한다.
public enum CardRoomResult {
  OK("OK"),
  HINTED_OK("HINTED_OK"),
  GIVE_UP("GIVE_UP");

  private final String dbValue;

  CardRoomResult(String dbValue) {
    this.dbValue = dbValue;
  }

  public String dbValue() {
    return dbValue;
  }

  public boolean matches(String value) {
    return dbValue.equals(value);
  }

  public boolean requiresChecker() {
    return this == OK;
  }

  public boolean requiresMemorizer() {
    return this == GIVE_UP;
  }

  public static Optional<CardRoomResult> find(String value) {
    for (CardRoomResult result : values()) {
      if (result.matches(value)) return Optional.of(result);
    }
    return Optional.empty();
  }
}
