package world.yeon.backend.card_rooms.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.card_rooms.dto.CreateCardRoomMessageRequest;
import world.yeon.backend.card_rooms.dto.SubmitCardRoomResultRequest;
import world.yeon.backend.card_rooms.repository.CardRoomRepository;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.ParticipantRow;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.RoomRow;

@ExtendWith(MockitoExtension.class)
class CardRoomServiceTests {
  private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-05-12T00:00:00Z");
  private static final RoomRow ROOM = new RoomRow(1L, "room_1", "방", "덱", "public", "answering", 0, NOW, NOW, "Host", 1, 1, 1);
  private static final ParticipantRow ROOM_PARTICIPANT = new ParticipantRow(1L, "participant_1", 1L, "방장", "guga", "MEMORIZER", true, true, NOW);
  private static final ParticipantRow OTHER_ROOM_PARTICIPANT = new ParticipantRow(2L, "participant_2", 99L, "다른 방", "guga", "CHECKER", false, true, NOW);

  @Mock private CardRoomRepository repository;
  private CardRoomService service;

  @BeforeEach
  void setUp() {
    service = new CardRoomService(repository);
  }

  @Test
  void 다른방참가자는메시지를남길수없다() {
    when(repository.findRoom("room_1")).thenReturn(ROOM);
    when(repository.findParticipant("participant_2")).thenReturn(OTHER_ROOM_PARTICIPANT);

    assertThatThrownBy(() -> service.addMessage("room_1", "participant_2", new CreateCardRoomMessageRequest("오염")))
      .isInstanceOf(CardRoomServiceException.class)
      .satisfies((error) -> assertThat(((CardRoomServiceException) error).status()).isEqualTo(403))
      .hasMessage("참가자가 해당 카드방에 속해 있지 않습니다.");

    verify(repository, never()).insertMessage(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
  }

  @Test
  void 다른방참가자는결과를저장할수없다() {
    when(repository.findRoom("room_1")).thenReturn(ROOM);
    when(repository.findParticipant("participant_2")).thenReturn(OTHER_ROOM_PARTICIPANT);

    assertThatThrownBy(() -> service.submitResult("room_1", "participant_2", new SubmitCardRoomResultRequest("card_1", "OK")))
      .isInstanceOf(CardRoomServiceException.class)
      .satisfies((error) -> assertThat(((CardRoomServiceException) error).status()).isEqualTo(403))
      .hasMessage("참가자가 해당 카드방에 속해 있지 않습니다.");

    verify(repository, never()).findCard("card_1");
    verify(repository, never()).insertResult(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
  }

  @Test
  void 마지막참가자가나가면카드방은목록에서사라지도록종료된다() {
    when(repository.findRoom("room_1")).thenReturn(ROOM);
    when(repository.findParticipant("participant_1")).thenReturn(ROOM_PARTICIPANT);
    when(repository.listParticipants(ROOM.internalId())).thenReturn(List.of());
    when(repository.listCards(ROOM.internalId())).thenReturn(List.of());
    when(repository.listMessages(ROOM.internalId())).thenReturn(List.of());
    when(repository.listResults(ROOM.internalId())).thenReturn(List.of());

    service.leaveRoom("room_1", "participant_1");

    verify(repository).leaveParticipant(org.mockito.ArgumentMatchers.eq(ROOM_PARTICIPANT.internalId()), org.mockito.ArgumentMatchers.any());
    verify(repository).updateStatus(org.mockito.ArgumentMatchers.eq(ROOM.internalId()), org.mockito.ArgumentMatchers.eq("finished"), org.mockito.ArgumentMatchers.eq(ROOM.currentCardIndex()), org.mockito.ArgumentMatchers.any());
  }
}
