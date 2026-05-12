package world.yeon.backend.card_rooms.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
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
}
