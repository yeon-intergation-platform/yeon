package world.yeon.backend.card_rooms.domain;

public enum CardRoomError {
  INVALID_DECK_SOURCE(400, "INVALID_DECK_SOURCE", "덱 또는 게스트 덱 스냅샷 중 하나가 필요합니다."),
  LOGIN_REQUIRED(401, "LOGIN_REQUIRED", "내 덱으로 카드방을 만들려면 로그인해 주세요."),
  DECK_NOT_FOUND(404, "DECK_NOT_FOUND", "덱을 찾지 못했습니다."),
  GUEST_ID_REQUIRED(400, "GUEST_ID_REQUIRED", "게스트 식별자가 필요합니다."),
  EMPTY_DECK(400, "EMPTY_DECK", "카드가 1장 이상 있는 덱이 필요합니다."),
  CARD_NOT_FOUND(404, "CARD_NOT_FOUND", "카드를 찾지 못했습니다."),
  CHECKER_ONLY(403, "CHECKER_ONLY", "OK는 봐주는 사람만 확정할 수 있습니다."),
  MEMORIZER_ONLY(403, "MEMORIZER_ONLY", "포기는 외우는 사람만 할 수 있습니다."),
  HOST_ONLY(403, "HOST_ONLY", "방장만 수행할 수 있습니다."),
  ROOM_CLOSED(410, "ROOM_CLOSED", "이미 종료된 카드방입니다."),
  ROOM_NOT_WAITING(409, "ROOM_NOT_WAITING", "대기 중인 카드방만 시작할 수 있습니다."),
  ROLE_REQUIRED(409, "ROLE_REQUIRED", "외우는 사람과 봐주는 사람이 각각 1명 이상 필요합니다."),
  ROLE_UNASSIGNED(409, "ROLE_UNASSIGNED", "모든 참가자가 역할을 정해야 시작할 수 있습니다."),
  READY_REQUIRED(409, "READY_REQUIRED", "모든 참가자가 준비해야 시작할 수 있습니다."),
  ROOM_ALREADY_STARTED(409, "ROOM_ALREADY_STARTED", "학습 시작 후에는 역할이나 준비 상태를 바꿀 수 없습니다."),
  ROOM_NOT_IN_PROGRESS(409, "ROOM_NOT_IN_PROGRESS", "학습 진행 중인 카드에만 결과를 저장할 수 있습니다."),
  CARD_NOT_RESOLVED(409, "CARD_NOT_RESOLVED", "현재 카드 결과를 먼저 확정해 주세요."),
  ROOM_NOT_FOUND(404, "ROOM_NOT_FOUND", "카드방을 찾지 못했습니다."),
  PARTICIPANT_NOT_FOUND(404, "PARTICIPANT_NOT_FOUND", "참가자를 찾지 못했습니다."),
  PARTICIPANT_ROOM_MISMATCH(403, "PARTICIPANT_ROOM_MISMATCH", "참가자가 해당 카드방에 속해 있지 않습니다."),
  PARTICIPANT_NOT_OWNED(403, "PARTICIPANT_NOT_OWNED", "본인 참가자 정보만 변경할 수 있습니다."),
  PROFILE_REQUIRED(400, "PROFILE_REQUIRED", "카드방 프로필이 필요합니다."),
  INVALID_RESULT(400, "INVALID_RESULT", "결과 값이 올바르지 않습니다.");

  private final int status;
  private final String code;
  private final String message;

  CardRoomError(int status, String code, String message) {
    this.status = status;
    this.code = code;
    this.message = message;
  }

  public int status() {
    return status;
  }

  public String code() {
    return code;
  }

  public String message() {
    return message;
  }
}
