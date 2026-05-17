package world.yeon.backend.card_rooms.domain;

public enum CardRoomSystemMessage {
  ROOM_CREATED("카드방이 만들어졌습니다."),
  STUDY_STARTED("학습을 시작했습니다."),
  ROOM_CLOSED("방장이 카드방을 종료했습니다."),
  PARTICIPANT_JOINED_SUFFIX("님이 입장했습니다.");

  private final String text;

  CardRoomSystemMessage(String text) {
    this.text = text;
  }

  public String text() {
    return text;
  }

  public static String participantJoined(String nickname) {
    return nickname + PARTICIPANT_JOINED_SUFFIX.text;
  }
}
