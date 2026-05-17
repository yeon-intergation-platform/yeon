package world.yeon.backend.card_rooms.domain;

public enum CardRoomMessageType {
  SYSTEM("system"),
  USER("user");

  private final String dbValue;

  CardRoomMessageType(String dbValue) {
    this.dbValue = dbValue;
  }

  public String dbValue() {
    return dbValue;
  }
}
