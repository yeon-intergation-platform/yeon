package world.yeon.backend.card_rooms.service;

import world.yeon.backend.card_rooms.domain.CardRoomError;
import world.yeon.backend.common.error.ApiException;

public class CardRoomServiceException extends ApiException {

  public CardRoomServiceException(int status, String code, String message) {
    super(status, code, message);
  }

  public CardRoomServiceException(CardRoomError error) {
    this(error.status(), error.code(), error.message());
  }

  public static CardRoomServiceException invalidText(String message) {
    return new CardRoomServiceException(400, "INVALID_TEXT", message);
  }
}
