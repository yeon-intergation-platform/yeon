package world.yeon.backend.card_rooms.service;

import org.springframework.stereotype.Component;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomDetailDto;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomParticipantDto;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomParticipantResponse;

@Component
public class CardRoomParticipantResponseFactory {
  private final CardRoomParticipantTokenService participantTokenService;

  public CardRoomParticipantResponseFactory(CardRoomParticipantTokenService participantTokenService) {
    this.participantTokenService = participantTokenService;
  }

  public CardRoomParticipantResponse create(CardRoomParticipantDto participant, CardRoomDetailDto detail) {
    return new CardRoomParticipantResponse(participant, detail, participantTokenService.issue(detail.id(), participant.id()));
  }
}
