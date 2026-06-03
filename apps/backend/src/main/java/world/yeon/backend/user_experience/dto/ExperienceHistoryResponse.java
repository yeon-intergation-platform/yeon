package world.yeon.backend.user_experience.dto;

import java.util.List;

/** 경험치 적립 이력 응답. */
public record ExperienceHistoryResponse(List<ExperienceHistoryItem> items) {
  /**
   * 적립 이력 한 건.
   *
   * @param activityType 활동 유형 키
   * @param xpAmount 적립량
   * @param referenceId 참조 식별자
   * @param totalXpAfter 적립 직후 누적 경험치
   * @param createdAt ISO-8601 시각
   */
  public record ExperienceHistoryItem(String activityType, int xpAmount, String referenceId, long totalXpAfter, String createdAt) {}
}
