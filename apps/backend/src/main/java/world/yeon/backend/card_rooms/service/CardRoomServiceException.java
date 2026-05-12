package world.yeon.backend.card_rooms.service;

public class CardRoomServiceException extends RuntimeException {
  private final int status;
  private final String code;
  public CardRoomServiceException(int status, String code, String message) {
    super(message); this.status = status; this.code = code;
  }
  public int status() { return status; }
  public String code() { return code; }
}
