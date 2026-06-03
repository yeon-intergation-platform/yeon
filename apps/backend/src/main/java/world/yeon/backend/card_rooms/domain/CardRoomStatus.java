package world.yeon.backend.card_rooms.domain;

// 방 수준 라이프사이클만 표현한다(finding 20). 카드 단위 진행 상태(정답 공개/결과)는
// 방 status가 아니라 card_rooms.current_card_revealed 컬럼과 card_room_results로 분리한다.
public enum CardRoomStatus {
  WAITING("waiting"),
  IN_PROGRESS("in_progress"),
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
