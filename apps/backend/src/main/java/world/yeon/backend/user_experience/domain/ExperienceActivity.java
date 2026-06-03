package world.yeon.backend.user_experience.domain;

/**
 * 전역 경험치 활동 유형. 활동 키(activity_type 컬럼 저장값)와 기본 적립량(xp)을 한 곳에 모은다.
 *
 * <p>1차에서 실제 적립 훅이 연결되는 활동은 {@link #DECK_CREATED}, {@link #CARD_ROOM_FINISHED},
 * {@link #DAILY_LOGIN} 3종이다. 나머지는 후속 단계 연결을 위해 상수만 정의해 둔다.
 */
public enum ExperienceActivity {
  DECK_CREATED("deck_created", 20),
  CARD_ROOM_FINISHED("card_room_finished", 50),
  TYPING_RACE_FINISHED("typing_race_finished", 30),
  COMMUNITY_POST("community_post", 10),
  DAILY_LOGIN("daily_login", 10);

  private final String key;
  private final int defaultXp;

  ExperienceActivity(String key, int defaultXp) {
    this.key = key;
    this.defaultXp = defaultXp;
  }

  /** experience_log.activity_type 에 저장되는 안정적인 문자열 키. */
  public String key() {
    return key;
  }

  /** 활동 1회당 기본 적립 경험치. */
  public int defaultXp() {
    return defaultXp;
  }
}
