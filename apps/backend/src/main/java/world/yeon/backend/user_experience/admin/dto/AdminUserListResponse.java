package world.yeon.backend.user_experience.admin.dto;

import java.util.List;

/** 어드민 유저 목록(레벨/총경험치/카드덱수 포함). */
public record AdminUserListResponse(List<AdminUserItem> users) {
  /**
   * @param id 유저 ID
   * @param email 이메일
   * @param displayName 표시 이름
   * @param role 권한
   * @param level 현재 레벨
   * @param totalXp 누적 경험치
   * @param cardDeckCount 보유 카드덱 수
   * @param createdAt ISO-8601 가입 시각
   */
  public record AdminUserItem(String id, String email, String displayName, String role, int level, long totalXp, int cardDeckCount, String createdAt) {}
}
