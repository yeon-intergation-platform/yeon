package world.yeon.backend.card_rooms.domain;

public enum CardRoomParticipantRole {
  // 역할 미배정(finding 21). 3인 이상에서 강제 배정/불균형을 검출하기 위해
  // '아직 역할이 정해지지 않음'을 1급 상태로 표현한다. startRoom 시 검증으로 막는다.
  UNASSIGNED("UNASSIGNED"),
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

  // 유효 역할(외우는 사람/봐주는 사람) 여부. UNASSIGNED는 시작 검증에서 미배정으로 걸린다.
  public boolean isAssigned() {
    return this == MEMORIZER || this == CHECKER;
  }

  public static CardRoomParticipantRole fromNullable(String value, CardRoomParticipantRole fallback) {
    if (CHECKER.matches(value)) return CHECKER;
    if (MEMORIZER.matches(value)) return MEMORIZER;
    if (UNASSIGNED.matches(value)) return UNASSIGNED;
    return fallback;
  }
}
