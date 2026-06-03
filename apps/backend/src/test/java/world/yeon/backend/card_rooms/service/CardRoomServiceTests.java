package world.yeon.backend.card_rooms.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.mockito.ArgumentMatchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.card_rooms.domain.CardRoomStatus;
import world.yeon.backend.card_rooms.dto.CardRoomProfileRequest;
import world.yeon.backend.card_rooms.dto.CreateCardRoomMessageRequest;
import world.yeon.backend.card_rooms.dto.SubmitCardRoomResultRequest;
import world.yeon.backend.card_rooms.dto.UpdateCardRoomParticipantRequest;
import world.yeon.backend.card_rooms.repository.CardRoomRepository;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.ParticipantRow;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.RoomRow;

@ExtendWith(MockitoExtension.class)
class CardRoomServiceTests {
  private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-05-12T00:00:00Z");
  private static final UUID HOST_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
  private static final RoomRow ROOM = new RoomRow(1L, "room_1", "방", "덱", "public", "in_progress", 0, false, NOW, NOW, "Host", 1, 1, 1);
  private static final RoomRow WAITING_ROOM = new RoomRow(1L, "room_1", "방", "덱", "public", "waiting", 0, false, NOW, NOW, "Host", 1, 1, 1);
  private static final ParticipantRow ROOM_PARTICIPANT = new ParticipantRow(1L, "participant_1", 1L, HOST_USER_ID, null, "방장", "guga", "MEMORIZER", true, true, NOW);
  private static final ParticipantRow OTHER_ROOM_PARTICIPANT = new ParticipantRow(2L, "participant_2", 99L, null, "guest-2", "다른 방", "guga", "CHECKER", false, true, NOW);
  private static final ParticipantRow CHECKER_PARTICIPANT = new ParticipantRow(3L, "participant_3", 1L, null, "guest-3", "봐주는이", "guga", "CHECKER", false, true, NOW);
  private static final ParticipantRow UNASSIGNED_PARTICIPANT = new ParticipantRow(4L, "participant_4", 1L, null, "guest-4", "미정이", "guga", "UNASSIGNED", false, true, NOW);
  private static final CardRoomRepository.CardRow CARD_0 = new CardRoomRepository.CardRow(10L, "card_1", 1L, 0, "앞", "뒤");
  private static final CardRoomRepository.CardRow CARD_1 = new CardRoomRepository.CardRow(11L, "card_2", 1L, 1, "앞2", "뒤2");

  @Mock private CardRoomRepository repository;
  private CardRoomService service;

  @BeforeEach
  void setUp() {
    service = new CardRoomService(repository, new CardRoomParticipantTokenService(new org.springframework.mock.env.MockEnvironment()));
  }

  @Test
  void 다른방참가자는메시지를남길수없다() {
    when(repository.findRoom("room_1")).thenReturn(ROOM);
    when(repository.findParticipant("participant_2")).thenReturn(OTHER_ROOM_PARTICIPANT);

    assertThatThrownBy(() -> service.addMessage("room_1", "participant_2", new CreateCardRoomMessageRequest("오염")))
      .isInstanceOf(CardRoomServiceException.class)
      .satisfies((error) -> assertThat(((CardRoomServiceException) error).status()).isEqualTo(403))
      .hasMessage("참가자가 해당 카드방에 속해 있지 않습니다.");

    verify(repository, never()).insertMessage(ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any());
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
    verify(repository, never()).insertResult(ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any());
  }

  @Test
  void 마지막참가자가나가면카드방은목록에서사라지도록종료된다() {
    when(repository.findRoom("room_1")).thenReturn(ROOM);
    when(repository.findParticipant("participant_1")).thenReturn(ROOM_PARTICIPANT);
    when(repository.listParticipants(ROOM.internalId())).thenReturn(List.of());
    when(repository.listCards(ROOM.internalId())).thenReturn(List.of());
    when(repository.listMessages(ROOM.internalId())).thenReturn(List.of());
    when(repository.listResults(ROOM.internalId())).thenReturn(List.of());

    service.leaveRoom("room_1", "participant_1", HOST_USER_ID, null);

    verify(repository).leaveParticipant(ArgumentMatchers.eq(ROOM_PARTICIPANT.internalId()), ArgumentMatchers.any(OffsetDateTime.class));
    verify(repository).updateStatus(ArgumentMatchers.eq(ROOM.internalId()), ArgumentMatchers.eq(CardRoomStatus.CLOSED), ArgumentMatchers.eq(ROOM.currentCardIndex()), ArgumentMatchers.eq(ROOM.currentCardRevealed()), ArgumentMatchers.any(OffsetDateTime.class));
  }

  @Test
  void 다른사용자는참가자를강제퇴장시킬수없다() {
    when(repository.findRoom("room_1")).thenReturn(ROOM);
    when(repository.findParticipant("participant_1")).thenReturn(ROOM_PARTICIPANT);

    assertThatThrownBy(() -> service.leaveRoom("room_1", "participant_1", UUID.fromString("00000000-0000-0000-0000-0000000000ff"), null))
      .isInstanceOf(CardRoomServiceException.class)
      .satisfies((error) -> assertThat(((CardRoomServiceException) error).status()).isEqualTo(403))
      .hasMessage("본인 참가자 정보만 변경할 수 있습니다.");

    verify(repository, never()).leaveParticipant(ArgumentMatchers.any(), ArgumentMatchers.any(OffsetDateTime.class));
  }

  @Test
  void 다른사용자는참가자상태를변경할수없다() {
    when(repository.findRoom("room_1")).thenReturn(ROOM);
    when(repository.findParticipant("participant_2")).thenReturn(OTHER_ROOM_PARTICIPANT);
    // participant_2는 room_1 소속이 아니므로 방 불일치(403)로 먼저 막힌다.
    assertThatThrownBy(() -> service.updateParticipant("room_1", "participant_2", HOST_USER_ID, null, new UpdateCardRoomParticipantRequest(null, "CHECKER", null)))
      .isInstanceOf(CardRoomServiceException.class)
      .satisfies((error) -> assertThat(((CardRoomServiceException) error).status()).isEqualTo(403));

    verify(repository, never()).updateParticipant(ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any());
  }

  @Test
  void 진행중에는프로필도변경할수없다() {
    when(repository.findRoom("room_1")).thenReturn(ROOM);
    when(repository.findParticipant("participant_1")).thenReturn(ROOM_PARTICIPANT);

    assertThatThrownBy(() -> service.updateParticipant("room_1", "participant_1", HOST_USER_ID, null, new UpdateCardRoomParticipantRequest(new CardRoomProfileRequest("새닉네임", "guga"), null, null)))
      .isInstanceOf(CardRoomServiceException.class)
      .satisfies((error) -> assertThat(((CardRoomServiceException) error).status()).isEqualTo(409))
      .hasMessage("학습 시작 후에는 역할이나 준비 상태를 바꿀 수 없습니다.");

    verify(repository, never()).updateParticipant(ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any());
  }

  @Test
  void 역할미배정참가자가있으면학습을시작할수없다() {
    when(repository.findRoom("room_1")).thenReturn(WAITING_ROOM);
    when(repository.findParticipant("participant_1")).thenReturn(ROOM_PARTICIPANT);
    when(repository.listParticipants(WAITING_ROOM.internalId()))
      .thenReturn(List.of(ROOM_PARTICIPANT, CHECKER_PARTICIPANT, UNASSIGNED_PARTICIPANT));

    assertThatThrownBy(() -> service.startRoom("room_1", "participant_1"))
      .isInstanceOf(CardRoomServiceException.class)
      .satisfies((error) -> assertThat(((CardRoomServiceException) error).status()).isEqualTo(409))
      .hasMessage("모든 참가자가 역할을 정해야 시작할 수 있습니다.");

    verify(repository, never()).updateStatus(ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.anyInt(), ArgumentMatchers.anyBoolean(), ArgumentMatchers.any(OffsetDateTime.class));
  }

  @Test
  void 봐주는사람이없으면학습을시작할수없다() {
    when(repository.findRoom("room_1")).thenReturn(WAITING_ROOM);
    when(repository.findParticipant("participant_1")).thenReturn(ROOM_PARTICIPANT);
    // 모두 MEMORIZER만 있어 봐주는 사람이 없다(불균형).
    when(repository.listParticipants(WAITING_ROOM.internalId())).thenReturn(List.of(ROOM_PARTICIPANT));

    assertThatThrownBy(() -> service.startRoom("room_1", "participant_1"))
      .isInstanceOf(CardRoomServiceException.class)
      .satisfies((error) -> assertThat(((CardRoomServiceException) error).status()).isEqualTo(409))
      .hasMessage("외우는 사람과 봐주는 사람이 각각 1명 이상 필요합니다.");

    verify(repository, never()).updateStatus(ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.anyInt(), ArgumentMatchers.anyBoolean(), ArgumentMatchers.any(OffsetDateTime.class));
  }

  @Test
  void 다른카드결과로는현재카드를넘길수없다() {
    // finding 20 회귀 방지: 현재 카드(index 0)의 결과가 없으면 next는 통과하지 못한다.
    when(repository.findRoom("room_1")).thenReturn(ROOM);
    when(repository.findParticipant("participant_1")).thenReturn(ROOM_PARTICIPANT);
    when(repository.listCards(ROOM.internalId())).thenReturn(List.of(CARD_0, CARD_1));
    // 현재 카드(CARD_0)에는 결과가 없다(다른 카드 결과만 존재한다고 가정).
    when(repository.existsResultForCard(ROOM.internalId(), CARD_0.internalId())).thenReturn(false);

    assertThatThrownBy(() -> service.next("room_1", "participant_1"))
      .isInstanceOf(CardRoomServiceException.class)
      .satisfies((error) -> assertThat(((CardRoomServiceException) error).status()).isEqualTo(409))
      .hasMessage("현재 카드 결과를 먼저 확정해 주세요.");

    verify(repository, never()).updateStatus(ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.anyInt(), ArgumentMatchers.anyBoolean(), ArgumentMatchers.any(OffsetDateTime.class));
  }

  @Test
  void 정답공개는방status를유지하고공개플래그만바꾼다() {
    // reveal()은 방 status를 IN_PROGRESS로 유지하고 current_card_revealed만 true로 set한다.
    when(repository.findRoom("room_1")).thenReturn(ROOM);
    when(repository.findParticipant("participant_3")).thenReturn(CHECKER_PARTICIPANT);
    when(repository.listCards(ROOM.internalId())).thenReturn(List.of(CARD_0, CARD_1));

    service.reveal("room_1", "participant_3");

    verify(repository).updateCurrentCardRevealed(ArgumentMatchers.eq(ROOM.internalId()), ArgumentMatchers.eq(true), ArgumentMatchers.any(OffsetDateTime.class));
    verify(repository, never()).updateStatus(ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.anyInt(), ArgumentMatchers.anyBoolean(), ArgumentMatchers.any(OffsetDateTime.class));
  }

  @Test
  void 잔존정리는빈방과오래된방을종료한다() {
    when(repository.finishRoomsWithoutActiveParticipants(NOW)).thenReturn(2);
    when(repository.finishStaleRooms(NOW.minus(Duration.ofHours(6)), NOW)).thenReturn(3);

    int closedCount = service.cleanupStaleRooms(NOW, Duration.ofHours(6));

    assertThat(closedCount).isEqualTo(5);
    verify(repository).finishRoomsWithoutActiveParticipants(NOW);
    verify(repository).finishStaleRooms(NOW.minus(Duration.ofHours(6)), NOW);
  }
}
