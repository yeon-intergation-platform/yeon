package world.yeon.backend.card_rooms.domain;

public enum CardRoomVisibility {
  PUBLIC("public"),
  PRIVATE("private");

  private final String dbValue;

  CardRoomVisibility(String dbValue) {
    this.dbValue = dbValue;
  }

  public String dbValue() {
    return dbValue;
  }

  public static CardRoomVisibility fromNullable(String value) {
    return PRIVATE.dbValue.equals(value) ? PRIVATE : PUBLIC;
  }
}
