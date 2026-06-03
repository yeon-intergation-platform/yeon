package world.yeon.backend.user_experience.domain;

/**
 * 전역 단일 레벨 곡선(순수 함수). 외부 의존 없이 경험치 ↔ 레벨 변환만 담당한다.
 *
 * <p>정의:
 * <ul>
 *   <li>레벨 L → L+1 진급에 필요한 경험치: {@code 100 * L}</li>
 *   <li>레벨 L 도달에 필요한 누적 경험치: {@code 100 * (L-1) * L / 2} = {@code 50 * (L-1) * L}</li>
 * </ul>
 * 최소 레벨은 1이며 totalXp=0이면 Lv1, 다음 레벨까지 100이 필요하다.
 */
public final class LevelCurve {
  private LevelCurve() {}

  /**
   * 표시용 진행도.
   *
   * @param level 현재 레벨(1 이상)
   * @param xpIntoLevel 현재 레벨 진입 후 추가로 쌓은 경험치
   * @param xpForNextLevel 다음 레벨까지 필요한 총 경험치(현재 레벨 구간 크기)
   * @param totalXp 누적 경험치
   */
  public record Progress(int level, long xpIntoLevel, long xpForNextLevel, long totalXp) {}

  /** 누적 경험치로 현재 레벨을 구한다. 음수는 0으로 간주해 Lv1을 반환한다. */
  public static int levelForTotalXp(long totalXp) {
    long xp = Math.max(totalXp, 0);
    int level = 1;
    // cumulativeXpForLevel(level+1) 이 xp 이하인 동안 레벨을 올린다.
    while (cumulativeXpForLevel(level + 1) <= xp) {
      level++;
    }
    return level;
  }

  /** 레벨 L 도달에 필요한 누적 경험치. level<=1이면 0. */
  public static long cumulativeXpForLevel(int level) {
    if (level <= 1) {
      return 0L;
    }
    long l = level;
    return 50L * (l - 1L) * l;
  }

  /** 레벨 L → L+1 진급에 필요한 경험치(구간 크기). */
  public static long xpToNextLevel(int level) {
    int normalized = Math.max(level, 1);
    return 100L * normalized;
  }

  /** 누적 경험치를 표시용 진행도로 변환한다. */
  public static Progress progress(long totalXp) {
    long xp = Math.max(totalXp, 0);
    int level = levelForTotalXp(xp);
    long xpIntoLevel = xp - cumulativeXpForLevel(level);
    long xpForNextLevel = xpToNextLevel(level);
    return new Progress(level, xpIntoLevel, xpForNextLevel, xp);
  }
}
