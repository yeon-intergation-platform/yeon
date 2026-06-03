package world.yeon.backend.user_experience.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.user_experience.domain.ExperienceActivity;
import world.yeon.backend.user_experience.dto.InternalAwardExperienceRequest;
import world.yeon.backend.user_experience.service.ExperienceService;

@ExtendWith(MockitoExtension.class)
class InternalExperienceControllerTests {
  private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000020");

  @Mock private ExperienceService service;
  private InternalExperienceController controller;

  @BeforeEach
  void setUp() {
    controller = new InternalExperienceController(service);
  }

  @Test
  void 화이트리스트_활동은_적립을_위임한다() {
    var request = new InternalAwardExperienceRequest(USER_ID, "typing_race_finished", "race_1#" + USER_ID);

    var response = controller.award(request);

    assertThat(response.getStatusCode().value()).isEqualTo(200);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().awarded()).isTrue();
    verify(service).award(USER_ID, ExperienceActivity.TYPING_RACE_FINISHED, "race_1#" + USER_ID);
  }

  @Test
  void 화이트리스트_밖_활동은_거부하고_적립하지_않는다() {
    // community_post 는 내부 적립 화이트리스트(타자 레이스만)에 없으므로 거부되어야 한다.
    var request = new InternalAwardExperienceRequest(USER_ID, "community_post", "ref_1");

    var response = controller.award(request);

    assertThat(response.getStatusCode().value()).isEqualTo(400);
    verify(service, never()).award(any(), any(), anyString());
  }

  @Test
  void 알수없는_활동키는_거부한다() {
    var request = new InternalAwardExperienceRequest(USER_ID, "admin_bonus", "ref_1");

    var response = controller.award(request);

    assertThat(response.getStatusCode().value()).isEqualTo(400);
    verify(service, never()).award(any(), any(), anyString());
  }

  @Test
  void userId가_없으면_거부한다() {
    var request = new InternalAwardExperienceRequest(null, "typing_race_finished", "race_1");

    var response = controller.award(request);

    assertThat(response.getStatusCode().value()).isEqualTo(400);
    verify(service, never()).award(any(), any(), anyString());
  }

  @Test
  void referenceId가_비면_거부한다() {
    var request = new InternalAwardExperienceRequest(USER_ID, "typing_race_finished", "  ");

    var response = controller.award(request);

    assertThat(response.getStatusCode().value()).isEqualTo(400);
    verify(service, never()).award(any(), any(), anyString());
  }

  @Test
  void referenceId는_trim되어_적립된다() {
    var request = new InternalAwardExperienceRequest(USER_ID, "typing_race_finished", "  race_1  ");

    controller.award(request);

    verify(service).award(eq(USER_ID), eq(ExperienceActivity.TYPING_RACE_FINISHED), eq("race_1"));
  }
}
