package world.yeon.backend.user_experience.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class LevelCurveTests {

  @Test
  void totalXp0은_레벨1이고_진행도가_비어있다() {
    var progress = LevelCurve.progress(0);
    assertThat(progress.level()).isEqualTo(1);
    assertThat(progress.xpIntoLevel()).isEqualTo(0);
    assertThat(progress.xpForNextLevel()).isEqualTo(100);
    assertThat(progress.totalXp()).isEqualTo(0);
  }

  @Test
  void 레벨_경계를_정확히_계산한다() {
    assertThat(LevelCurve.levelForTotalXp(0)).isEqualTo(1);
    assertThat(LevelCurve.levelForTotalXp(99)).isEqualTo(1);
    assertThat(LevelCurve.levelForTotalXp(100)).isEqualTo(2);
    assertThat(LevelCurve.levelForTotalXp(299)).isEqualTo(2);
    assertThat(LevelCurve.levelForTotalXp(300)).isEqualTo(3);
    // 누적: L4 = 50*3*4 = 600, L5 = 50*4*5 = 1000
    assertThat(LevelCurve.levelForTotalXp(599)).isEqualTo(3);
    assertThat(LevelCurve.levelForTotalXp(600)).isEqualTo(4);
    assertThat(LevelCurve.levelForTotalXp(999)).isEqualTo(4);
    assertThat(LevelCurve.levelForTotalXp(1000)).isEqualTo(5);
  }

  @Test
  void 음수_경험치는_레벨1로_보정한다() {
    assertThat(LevelCurve.levelForTotalXp(-50)).isEqualTo(1);
    var progress = LevelCurve.progress(-50);
    assertThat(progress.level()).isEqualTo(1);
    assertThat(progress.xpIntoLevel()).isEqualTo(0);
    assertThat(progress.totalXp()).isEqualTo(0);
  }

  @Test
  void 누적경험치_공식이_정의와_일치한다() {
    assertThat(LevelCurve.cumulativeXpForLevel(1)).isEqualTo(0);
    assertThat(LevelCurve.cumulativeXpForLevel(2)).isEqualTo(100);
    assertThat(LevelCurve.cumulativeXpForLevel(3)).isEqualTo(300);
    assertThat(LevelCurve.cumulativeXpForLevel(4)).isEqualTo(600);
    assertThat(LevelCurve.cumulativeXpForLevel(5)).isEqualTo(1000);
  }

  @Test
  void 다음레벨_필요경험치는_100배_레벨이다() {
    assertThat(LevelCurve.xpToNextLevel(1)).isEqualTo(100);
    assertThat(LevelCurve.xpToNextLevel(2)).isEqualTo(200);
    assertThat(LevelCurve.xpToNextLevel(3)).isEqualTo(300);
  }

  @Test
  void 진행도는_현재레벨_구간내_경험치를_노출한다() {
    // 150 XP → 레벨2(누적 100), 레벨2 구간 진입 후 50, 레벨2→3 필요 200.
    var progress = LevelCurve.progress(150);
    assertThat(progress.level()).isEqualTo(2);
    assertThat(progress.xpIntoLevel()).isEqualTo(50);
    assertThat(progress.xpForNextLevel()).isEqualTo(200);
    assertThat(progress.totalXp()).isEqualTo(150);
  }
}
