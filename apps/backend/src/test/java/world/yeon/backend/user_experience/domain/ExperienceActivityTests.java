package world.yeon.backend.user_experience.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ExperienceActivityTests {

  @Test
  void 타자레이스완료는_내부적립_화이트리스트에_있다() {
    assertThat(ExperienceActivity.internalAwardableFromKey("typing_race_finished"))
      .contains(ExperienceActivity.TYPING_RACE_FINISHED);
  }

  @Test
  void 게임플레이는_내부적립_화이트리스트에_있다() {
    assertThat(ExperienceActivity.internalAwardableFromKey("game_play"))
      .contains(ExperienceActivity.GAME_PLAY);
    assertThat(ExperienceActivity.GAME_PLAY.defaultXp()).isEqualTo(15);
  }

  @Test
  void 화이트리스트밖_활동키는_빈값이다() {
    // community_post / daily_login 등은 내부 호출로 임의 적립되면 안 되므로 화이트리스트에서 제외한다.
    assertThat(ExperienceActivity.internalAwardableFromKey("community_post")).isEmpty();
    assertThat(ExperienceActivity.internalAwardableFromKey("daily_login")).isEmpty();
    assertThat(ExperienceActivity.internalAwardableFromKey("deck_created")).isEmpty();
  }

  @Test
  void 알수없거나_빈_키는_빈값이다() {
    assertThat(ExperienceActivity.internalAwardableFromKey("unknown")).isEmpty();
    assertThat(ExperienceActivity.internalAwardableFromKey(null)).isEmpty();
    assertThat(ExperienceActivity.internalAwardableFromKey("   ")).isEmpty();
  }

  @Test
  void 키는_공백을_trim하여_매칭한다() {
    assertThat(ExperienceActivity.internalAwardableFromKey("  typing_race_finished  "))
      .contains(ExperienceActivity.TYPING_RACE_FINISHED);
  }
}
