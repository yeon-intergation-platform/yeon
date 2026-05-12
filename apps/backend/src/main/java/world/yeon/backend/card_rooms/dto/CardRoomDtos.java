package world.yeon.backend.card_rooms.dto;
import java.util.List;

public class CardRoomDtos {
  public record CardRoomSummaryDto(String id, String title, String deckTitle, String hostLabel, String visibility, String status, int currentCardIndex, int cardCount, int memorizerCount, int checkerCount, String createdAt, String updatedAt) {}
  public record CardRoomParticipantDto(String id, String nickname, String characterId, String role, boolean isHost, boolean isReady, String joinedAt) {}
  public record CardRoomCardDto(String id, String frontText, String backText, int orderIndex) {}
  public record CardRoomMessageDto(String id, String senderParticipantId, String senderNickname, String content, String messageType, String createdAt) {}
  public record CardRoomResultDto(String id, String cardId, String participantId, String result, String createdAt) {}
  public record CardRoomDetailDto(String id, String title, String deckTitle, String hostLabel, String visibility, String status, int currentCardIndex, int cardCount, int memorizerCount, int checkerCount, String createdAt, String updatedAt, List<CardRoomParticipantDto> participants, List<CardRoomCardDto> cards, List<CardRoomMessageDto> messages, List<CardRoomResultDto> results) {}
  public record CardRoomListResponse(List<CardRoomSummaryDto> rooms) {}
  public record CardRoomResponse(CardRoomDetailDto room, CardRoomParticipantDto participant) {}
  public record CardRoomParticipantResponse(CardRoomParticipantDto participant, CardRoomDetailDto room) {}
  public record CardRoomMessagesResponse(List<CardRoomMessageDto> messages) {}
  public record CardRoomResultResponse(CardRoomResultDto result, CardRoomDetailDto room) {}
}
