package world.yeon.backend.card_rooms.domain;

import java.util.Optional;

public enum CardRoomResult {
  OK("OK", CardRoomStatus.PASSED),
  HINTED_OK("HINTED_OK", CardRoomStatus.PASSED),
  GIVE_UP("GIVE_UP", CardRoomStatus.GIVEN_UP);

  private final String dbValue;
  private final CardRoomStatus nextStatus;

  CardRoomResult(String dbValue, CardRoomStatus nextStatus) {
    this.dbValue = dbValue;
    this.nextStatus = nextStatus;
  }

  public String dbValue() {
    return dbValue;
  }

  public CardRoomStatus nextStatus() {
    return nextStatus;
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
