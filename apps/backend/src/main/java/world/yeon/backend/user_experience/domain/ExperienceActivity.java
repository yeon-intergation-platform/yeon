package world.yeon.backend.user_experience.domain;

import java.util.Optional;
import java.util.Set;

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

  /**
   * 내부(race-server 등) 적립 엔드포인트가 외부 입력 activityType 으로 적립할 수 있는 활동 화이트리스트.
   * 임의 활동(예: 운영자 전용 보너스)을 내부 호출로 적립하지 못하도록, 신뢰 경계 안에서도 키 입력을
   * 이 집합으로 제한한다. 현재는 타자 레이스 완료만 내부 호출로 적립한다.
   */
  private static final Set<ExperienceActivity> INTERNAL_AWARDABLE = Set.of(TYPING_RACE_FINISHED);

  /**
   * 내부 적립 엔드포인트용 안전 조회. 화이트리스트에 있는 활동의 key 와 정확히 일치할 때만 반환한다.
   * 알 수 없거나 화이트리스트 밖 키는 {@link Optional#empty()} 라 호출부에서 거부할 수 있다.
   */
  public static Optional<ExperienceActivity> internalAwardableFromKey(String key) {
    if (key == null || key.isBlank()) {
      return Optional.empty();
    }
    String normalized = key.trim();
    for (ExperienceActivity activity : INTERNAL_AWARDABLE) {
      if (activity.key.equals(normalized)) {
        return Optional.of(activity);
      }
    }
    return Optional.empty();
  }
}
