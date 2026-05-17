package world.yeon.backend.card_rooms.domain;

public enum CardRoomStatus {
  WAITING("waiting"),
  ANSWERING("answering"),
  REVEALED("revealed"),
  PASSED("passed"),
  GIVEN_UP("given_up"),
  FINISHED("finished"),
  CLOSED("closed");

  private final String dbValue;

  CardRoomStatus(String dbValue) {
    this.dbValue = dbValue;
  }

  public String dbValue() {
    return dbValue;
  }

  public boolean matches(String value) {
    return dbValue.equals(value);
  }
}
