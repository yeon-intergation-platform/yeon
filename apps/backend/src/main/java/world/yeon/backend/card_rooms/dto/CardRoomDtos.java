package world.yeon.backend.card_rooms.dto;
import java.util.List;

public class CardRoomDtos {
  public record CardRoomSummaryDto(String id, String title, String deckTitle, String hostLabel, String visibility, String status, int currentCardIndex, int cardCount, int memorizerCount, int checkerCount, String createdAt, String updatedAt) {}
  public record CardRoomParticipantDto(String id, String nickname, String characterId, String role, boolean isHost, boolean isReady, String joinedAt) {}
  public record CardRoomCardDto(String id, String frontText, String backText, int orderIndex) {}
  public record CardRoomMessageDto(String id, String senderParticipantId, String senderNickname, String content, String messageType, String createdAt) {}
  public record CardRoomResultDto(String id, String cardId, String participantId, String result, String createdAt) {}
  public record CardRoomDetailDto(String id, String title, String deckTitle, String hostLabel, String visibility, String status, int currentCardIndex, boolean currentCardRevealed, String currentCardResult, int cardCount, int memorizerCount, int checkerCount, String createdAt, String updatedAt, List<CardRoomParticipantDto> participants, List<CardRoomCardDto> cards, List<CardRoomMessageDto> messages, List<CardRoomResultDto> results) {}
  public record CardRoomListResponse(List<CardRoomSummaryDto> rooms) {}
  public record CardRoomResponse(CardRoomDetailDto room, CardRoomParticipantDto participant) {}
  // participantToken: race-server가 참가자 가장(finding 166)을 차단하기 위해 검증하는 소유 증명. 시크릿 미설정 환경에서는 null.
  public record CardRoomParticipantResponse(CardRoomParticipantDto participant, CardRoomDetailDto room, String participantToken) {}
  public record CardRoomMessagesResponse(List<CardRoomMessageDto> messages) {}
  public record CardRoomResultResponse(CardRoomResultDto result, CardRoomDetailDto room) {}
}
