package world.yeon.backend.card_rooms.domain;

public enum CardRoomTextRule {
  ROOM_TITLE(80, "방 제목을 입력해 주세요."),
  DECK_TITLE(120, "덱 제목을 입력해 주세요."),
  CARD_FACE(2000, "앞면과 뒷면을 모두 입력해 주세요."),
  NICKNAME(40, "닉네임을 입력해 주세요."),
  CHARACTER_ID(80, "캐릭터를 선택해 주세요."),
  CHAT_MESSAGE(500, "메시지를 입력해 주세요.");

  private final int maxLength;
  private final String requiredMessage;

  CardRoomTextRule(int maxLength, String requiredMessage) {
    this.maxLength = maxLength;
    this.requiredMessage = requiredMessage;
  }

  public int maxLength() {
    return maxLength;
  }

  public String requiredMessage() {
    return requiredMessage;
  }
}
