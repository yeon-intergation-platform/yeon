package world.yeon.backend.card_rooms.domain;

public enum CardRoomIdPrefix {
  ROOM("crm"),
  CARD("crc"),
  PARTICIPANT("crp"),
  MESSAGE("crmmsg"),
  RESULT("crr");

  private final String value;

  CardRoomIdPrefix(String value) {
    this.value = value;
  }

  public String value() {
    return value;
  }
}
