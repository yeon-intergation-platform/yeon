package world.yeon.backend.card_rooms.domain;

public enum CardRoomParticipantRole {
  MEMORIZER("MEMORIZER"),
  CHECKER("CHECKER");

  private final String dbValue;

  CardRoomParticipantRole(String dbValue) {
    this.dbValue = dbValue;
  }

  public String dbValue() {
    return dbValue;
  }

  public boolean matches(String value) {
    return dbValue.equals(value);
  }

  public static CardRoomParticipantRole fromNullable(String value, CardRoomParticipantRole fallback) {
    if (CHECKER.matches(value)) return CHECKER;
    if (MEMORIZER.matches(value)) return MEMORIZER;
    return fallback;
  }
}
