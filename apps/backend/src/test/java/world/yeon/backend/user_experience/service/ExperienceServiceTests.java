package world.yeon.backend.user_experience.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.user_experience.domain.ExperienceActivity;
import world.yeon.backend.user_experience.repository.ExperienceRepository;

@ExtendWith(MockitoExtension.class)
class ExperienceServiceTests {
  private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

  @Mock private ExperienceRepository repository;
  private ExperienceService service;

  @BeforeEach
  void setUp() {
    service = new ExperienceService(repository);
  }

  @Test
  void 게스트는_적립하지_않는다() {
    service.award(null, ExperienceActivity.DECK_CREATED, "dck_1");
    verify(repository, never()).insertLogIfAbsent(any(), anyString(), anyInt(), anyString());
    verify(repository, never()).upsertAddXp(any(), anyInt());
  }

  @Test
  void 최초적립은_누적을_올리고_로그_total을_확정한다() {
    when(repository.insertLogIfAbsent(USER_ID, "deck_created", 20, "dck_1")).thenReturn(true);
    when(repository.upsertAddXp(USER_ID, 20)).thenReturn(20L);

    service.award(USER_ID, ExperienceActivity.DECK_CREATED, "dck_1");

    verify(repository).insertLogIfAbsent(USER_ID, "deck_created", 20, "dck_1");
    verify(repository).upsertAddXp(USER_ID, 20);
    verify(repository).updateLogTotalAfter(USER_ID, "deck_created", "dck_1", 20L);
  }

  @Test
  void 중복적립은_누적을_올리지_않는다() {
    // 같은 (user, activity, reference) 두 번째 호출은 로그 가드가 0행이라 적립이 일어나지 않는다.
    when(repository.insertLogIfAbsent(USER_ID, "deck_created", 20, "dck_1")).thenReturn(false);

    service.award(USER_ID, ExperienceActivity.DECK_CREATED, "dck_1");

    verify(repository).insertLogIfAbsent(USER_ID, "deck_created", 20, "dck_1");
    verify(repository, never()).upsertAddXp(any(), anyInt());
    verify(repository, never()).updateLogTotalAfter(any(), anyString(), anyString(), anyLong());
  }

  @Test
  void 두번호출시_누적은_단_한번만_증가한다() {
    // 첫 호출만 가드 선점(true), 두 번째는 중복(false) → upsertAddXp 정확히 1회.
    when(repository.insertLogIfAbsent(USER_ID, "card_room_finished", 50, "room_1"))
      .thenReturn(true)
      .thenReturn(false);
    when(repository.upsertAddXp(USER_ID, 50)).thenReturn(50L);

    service.award(USER_ID, ExperienceActivity.CARD_ROOM_FINISHED, "room_1");
    service.award(USER_ID, ExperienceActivity.CARD_ROOM_FINISHED, "room_1");

    verify(repository, times(2)).insertLogIfAbsent(USER_ID, "card_room_finished", 50, "room_1");
    verify(repository, times(1)).upsertAddXp(USER_ID, 50);
    verify(repository, times(1)).updateLogTotalAfter(eq(USER_ID), eq("card_room_finished"), eq("room_1"), anyLong());
  }

  @Test
  void referenceId가_비면_적립하지_않는다() {
    service.award(USER_ID, ExperienceActivity.DAILY_LOGIN, " ");
    verify(repository, never()).insertLogIfAbsent(any(), anyString(), anyInt(), anyString());
  }

  @Test
  void 진행도조회는_누적경험치로_레벨을_계산한다() {
    when(repository.findTotalXp(USER_ID)).thenReturn(150L);
    var view = service.getProgress(USER_ID);
    assertThat(view.level()).isEqualTo(2);
    assertThat(view.totalXp()).isEqualTo(150L);
    assertThat(view.xpIntoLevel()).isEqualTo(50L);
    assertThat(view.xpForNextLevel()).isEqualTo(200L);
  }

  @Test
  void 비로그인_진행도조회는_401이다() {
    assertThatThrownBy(() -> service.getProgress(null))
      .isInstanceOf(ExperienceServiceException.class)
      .satisfies(error -> assertThat(((ExperienceServiceException) error).status()).isEqualTo(401));
  }
}
