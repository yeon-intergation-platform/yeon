package world.yeon.backend.card_rooms.service;

import world.yeon.backend.card_rooms.domain.CardRoomError;

public class CardRoomServiceException extends RuntimeException {
  private final int status;
  private final String code;

  public CardRoomServiceException(int status, String code, String message) {
    super(message); this.status = status; this.code = code;
  }

  public CardRoomServiceException(CardRoomError error) {
    this(error.status(), error.code(), error.message());
  }

  public static CardRoomServiceException invalidText(String message) {
    return new CardRoomServiceException(400, "INVALID_TEXT", message);
  }

  public int status() { return status; }
  public String code() { return code; }
}
